#include "server.hpp"

namespace server
{
  /**
   * Initialize the SSL context for the server.
   * This is used to set up the server's SSL context with the appropriate certificates and keys.
   * Currently it's mainly used to check the source of a request to prevent CSRF attacks with annotations.
   *
   * @return SSL context for the server.
   */
  ssl::context init_ssl_context()
  {
    ssl::context ctx(ssl::context::tlsv13_server);

    SSL_CTX_set_ciphersuites(ctx.native_handle(),
      "TLS_AES_256_GCM_SHA384:"
      "TLS_CHACHA20_POLY1305_SHA256:");

    ctx.set_options(
      ssl::context::no_sslv2 |
      ssl::context::no_sslv3 |
      ssl::context::no_compression
    );

    ctx.set_verify_mode(ssl::verify_peer | ssl::verify_fail_if_no_peer_cert);
    ctx.set_verify_depth(4);
    
    try
    {
      // ... load certificates and keys ...
      ctx.use_certificate_chain_file("../key/server.crt.pem");
      ctx.use_private_key_file("../key/server.key.pem", ssl::context::pem);
      ctx.use_tmp_dh_file("../key/dhparam.pem");
      ctx.load_verify_file("../key/server.chain.crt.pem");

      ctx.set_verify_callback(
        [](bool preverified, ssl::verify_context& ctx)
        {
          X509_STORE_CTX* cts = ctx.native_handle();
          if (!preverified)
          {
            int depth = X509_STORE_CTX_get_error_depth(cts);
            int err = X509_STORE_CTX_get_error(cts);
                
            // ... accept self-signed certificates from localhost ...
            if (depth == 0 &&  (err == X509_V_ERR_DEPTH_ZERO_SELF_SIGNED_CERT ||
              err == X509_V_ERR_SELF_SIGNED_CERT_IN_CHAIN) && READER_LOCAL_HOST == "true")
            {
              // std::cerr << "Accepting self-signed certificate" << std::endl;
              return true;
            }
                
            std::cerr << "Certificate verification failed: " 
              << X509_verify_cert_error_string(err) << std::endl;
            }
            return preverified;
        });
        
      if (!SSL_CTX_check_private_key(ctx.native_handle()))
      {
        throw std::runtime_error("Private key check failed");
      }
    }
    catch (const std::exception & e)
    {
      std::cerr << "SSL error: " << e.what() << std::endl;
      throw;
    }

    return ctx;
  }

  SSLSession::SSLSession(tcp::socket socket, ssl::context & ctx)
    : stream_(std::move(socket), ctx) { }

  void SSLSession::run()
  {
    do_handshake();
  }

  /**
   * Perform the SSL handshake with the client.
   */
  void SSLSession::do_handshake()
  {
    auto self = shared_from_this();

    stream_.async_handshake(ssl::stream_base::server,
      [this, self](beast::error_code ec)
      {
        if (!ec)
        {
          do_read();
        }
      });
  }

  /**
   * Read a request from the client.
   */
  void SSLSession::do_read()
  {
    auto self = shared_from_this();
    
    buffer_.consume(buffer_.size());
    req_ = {};
    
    auto stream_ptr = std::shared_ptr<ssl::stream<tcp::socket>>(
      &stream_,
      [](ssl::stream<tcp::socket>*) {}
    );
    sslstream::SSLStreamWrapper::set_current_stream(stream_ptr);

    http::async_read(stream_, buffer_, req_,
      [this, self](beast::error_code ec, std::size_t bytes_transferred)
      {
        if (ec == http::error::end_of_stream)
        {
          // ... connection closed correctly ...
          return do_close();
        }
        
        if (ec)
        {
          return do_close();
        }

        auto ip_address = stream_.next_layer().remote_endpoint().address();
        auto res = handle_request(req_, ip_address.to_string());
        do_write(std::move(res));
      });
  }

  /**
   * Write a response to the client.
   * @param res Response to write.
   */
  void SSLSession::do_write(http::response<http::string_body> res)
  {
    auto self = shared_from_this();

    
    auto sp = std::make_shared<http::response<http::string_body>>(std::move(res));

    http::async_write(stream_, *sp,
    [this, self, sp](beast::error_code ec, std::size_t bytes_transferred)
    {
      if (!ec)
      {
        do_read();
      }
      else
      {
        do_close();
      }
    });
  }

  /**
   * Close the connection with the client.
   */
  void SSLSession::do_close()
  {
    auto self = shared_from_this();
    stream_.async_shutdown(
    [this, self](beast::error_code ec)
    {
      if (ec == net::error::eof)
      {
        ec = {};
      }
    });
  }

  /**
    * Load all request handlers from the specified directory.
    * This function loads all shared objects (.so files) from the specified directory and
    * looks for a function named create_<handler_name>_handler in each of them.
    *
    * @param directory Directory to load handlers from.
    * @return Vector of unique pointers to the loaded request handlers.
    */
  std::vector<std::unique_ptr<RequestHandler>> load_handlers(const std::string& directory)
  {
    std::vector<std::unique_ptr<RequestHandler>> handlers;

    for (std::filesystem::directory_entry const& entry : std::filesystem::directory_iterator(directory)) {
      if (entry.path().extension() == ".so") {
        void* lib_handle = dlopen(entry.path().c_str(), RTLD_LAZY);
        if (!lib_handle) {
          throw std::runtime_error("Failed to load library: " + entry.path().string());
        }

        std::string filename = entry.path().stem().string();
        if (filename.rfind("lib", 0) == 0)
        {
          filename = filename.substr(3);
        }
        std::string function_name = "create_" + filename + "_handler";
        RequestHandler* (*create_handler)() = reinterpret_cast<RequestHandler* (*)()>(dlsym(lib_handle, function_name.c_str()));
        if (!create_handler)
        {
          dlclose(lib_handle);
          throw std::runtime_error("Failed to find " + function_name + " function in: " + entry.path().string());
        }
        handlers.emplace_back(create_handler());
      }
    }

    return handlers;
  }

  /**
    * Handle an HTTP request. This function iterates over all loaded request handlers and
    * calls their handle_request method if the request target starts with the handler's endpoint.
    *
    * @param req HTTP request to handle.
    * @return HTTP response.
    */
  http::response<http::string_body> handle_request(http::request<http::string_body> const& req, const std::string& ip_address)
  {
    static std::vector<std::unique_ptr<RequestHandler>> handlers = load_handlers(".");
    http::response<http::string_body> res;
    std::string allowed_methods = "DELETE, GET, OPTIONS, PATCH, POST, PUT";

    // handle CORS preflight request
    if (req.method() == http::verb::options)
    {
      res = {http::status::no_content, req.version()};
      res.set(http::field::access_control_allow_origin, req["Origin"].to_string());
      res.set(http::field::access_control_allow_methods, allowed_methods);
      res.set(http::field::access_control_allow_headers, "Content-Type, Authorization, Access-Control-Allow-Origin");
      res.set(http::field::access_control_allow_credentials, "true");
      return res;
    }

    for (const auto & handler : handlers)
    {
      if (req.target().starts_with(handler->get_endpoint()))
      {
        res = handler->handle_request(req, ip_address);
        break;
      }
    }

    if (res.result() == http::status::unknown)
    {
      std::cerr << "No handler found for endpoint: " << req.target() << std::endl;
      res = {http::status::not_found, req.version()};
    }

    // set CORS headers
    res.set(http::field::access_control_allow_origin, req["Origin"].to_string());
    res.set(http::field::access_control_allow_methods, allowed_methods);
    res.set(http::field::access_control_allow_headers, "Content-Type, Authorization");
    res.set(http::field::access_control_allow_credentials, "true");
    
    return res;
  }

  Session::Session(tcp::socket socket) : socket_(std::move(socket)) {}
  void Session::run()
  {
    do_read();
  }

  /**
   * Read a request from the client.
   */
  void Session::do_read()
  {
    auto self(shared_from_this());
    http::async_read(socket_, buffer_, req_, [this, self](beast::error_code ec, std::size_t)
    {
      if (!ec)
      {
        boost::asio::ip::address ip_address = socket_.remote_endpoint().address();
        std::string ip_str = ip_address.to_string();
        http::response<http::string_body> res = handle_request(req_, ip_str);
        do_write(std::move(res));
      }
    });
  }

  /**
   * Write a response to the client.
   * @param res Response to write.
   */
  void Session::do_write(http::response<http::string_body> res)
  {
    auto self(shared_from_this());
    auto sp = std::make_shared<http::response<http::string_body>>(std::move(res));
    http::async_write(socket_, *sp, [this, self, sp](beast::error_code ec, std::size_t)
    {
      socket_.shutdown(tcp::socket::shutdown_send, ec);
    });
  }
  
  Listener::Listener(net::io_context& ioc, tcp::endpoint endpoint) : ioc_(ioc),
    acceptor_(net::make_strand(ioc)), ctx_(init_ssl_context())
  {
    beast::error_code ec;

    acceptor_.open(endpoint.protocol(), ec);
    if (ec)
    {
      std::cerr << "Open error: " << ec.message() << std::endl;
      return;
    }

    acceptor_.set_option(net::socket_base::reuse_address(true), ec);
    if (ec)
    {
      std::cerr << "Set option error: " << ec.message() << std::endl;
      return;
    }

    acceptor_.bind(endpoint, ec);
    if (ec)
    {
      std::cerr << "Bind error: " << ec.message() << std::endl;
      return;
    }

    acceptor_.listen(net::socket_base::max_listen_connections, ec);
    if (ec)
    {
      std::cerr << "Listen error: " << ec.message() << std::endl;
      return;
    }

    do_accept();
  }

  /**
   * Start accepting incoming connections.
   */
  void Listener::do_accept()
  {
    acceptor_.async_accept(net::make_strand(ioc_), [this](beast::error_code ec, tcp::socket socket)
    {
      if (!ec)
      {
        // std::make_shared<Session>(std::move(socket))->run();
        std::make_shared<SSLSession>(std::move(socket), ctx_)->run();
      }
      do_accept();
    });
  }
}