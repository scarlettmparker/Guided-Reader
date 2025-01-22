#include "server.hpp"

namespace server
{
  /**
   * Initialize the SSL context for the server.
   * This is used to set up the server's SSL context with the appropriate certificates and keys.
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

    SSL_CTX_set_session_cache_mode(ctx.native_handle(), SSL_SESS_CACHE_SERVER);
    
    try
    {
      // ... load certificates and keys ...
      ctx.use_certificate_chain_file(READER_FULL_CHAIN);
      ctx.use_private_key_file(READER_PRIVATE_KEY, ssl::context::pem);
      ctx.use_tmp_dh_file(READER_DH_PARAM);
      ctx.load_verify_file(READER_CHAIN);

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
    : stream_(std::move(socket), ctx)
    , timer_(stream_.get_executor()) { }

  void SSLSession::run()
  {
    do_handshake();
  }
  
  void SSLSession::cancel_timer()
  {
    if (!timer_cancelled_)
    {
      beast::error_code ec;
      timer_.cancel(ec);
      timer_cancelled_ = true;
    }
  }

  /**
   * Perform the SSL handshake with the client.
   */
  void SSLSession::do_handshake()
  {
    auto self = shared_from_this();
    
    // ... handshake timeout ...
    timer_.expires_after(std::chrono::seconds(HANDSHAKE_TIMEOUT_SECONDS));
    timer_.async_wait([self](beast::error_code ec)
    {
      if (!ec) self->stream_.next_layer().close();
    });
    
    stream_.async_handshake(ssl::stream_base::server,
      [this, self](beast::error_code ec)
      {
        if (!ec)
        {
          do_read();
        }
        else 
        {
          std::cerr << "Handshake error: " << ec.message() << std::endl;
          do_close();
        }
      });
  }

  /**
   * Read a request from the client.
   */
  void SSLSession::do_read()
  {
    if (state_ == State::CLOSING || state_ == State::CLOSED)
    {
      return;
    }

    auto self = shared_from_this();
    state_ = State::READING;
    timer_cancelled_ = false;

    // ... read timeout ...
    timer_.expires_after(std::chrono::seconds(READ_TIMEOUT_SECONDS));
    timer_.async_wait([self](beast::error_code ec)
    {
      if (!ec)
      {
        self->state_ = State::CLOSING;
        self->stream_.next_layer().close();
      }
    });

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
        cancel_timer();

        if (state_ == State::CLOSING)
        {
          return;
        }

        if (ec == http::error::end_of_stream || ec == net::error::operation_aborted)
        {
          // ... client closed connection ...
          return do_close();
        }
        
        if (ec)
        {
          std::cerr << "Read error: " << ec.message() << std::endl;
          return do_close();
        }

        try 
        {
          auto ip_address = stream_.next_layer().remote_endpoint().address();
          auto res = handle_request(req_, ip_address.to_string());
          state_ = State::WRITING;
          do_write(std::move(res));
        }
        catch(const std::exception& e)
        {
          std::cerr << "Request handling error: " << e.what() << std::endl;
          do_close();
        }
      });
  }

  /**
   * Write a response to the client.
   * @param res Response to write.
   */
  void SSLSession::do_write(http::response<http::string_body> res)
  {
    if (state_ == State::CLOSING || state_ == State::CLOSED)
    {
      return;
    }

    auto self = shared_from_this();
    timer_cancelled_ = false;

    // ... write timeout ...
    timer_.expires_after(std::chrono::seconds(WRITE_TIMEOUT_SECONDS));
    timer_.async_wait([self](beast::error_code ec)
    {
      if (!ec)
      {
        self->state_ = State::CLOSING;
        self->stream_.next_layer().close();
      }
    });

    auto sp = std::make_shared<http::response<http::string_body>>(std::move(res));

    http::async_write(stream_, *sp,
      [this, self, sp](beast::error_code ec, std::size_t)
      {
        cancel_timer();

        if (state_ == State::CLOSING)
        {
          return;
        }

        if (ec == net::error::operation_aborted)
        {
          return do_close();
        }

        if (ec)
        {
          std::cerr << "Write error: " << ec.message() << std::endl;
          return do_close();
        }

        state_ = State::READING;
        do_read();
      });
  }

  /**
   * Close the connection with the client.
   */
  void SSLSession::do_close()
  {
    if (state_ == State::CLOSED)
    {
      return;
    }

    state_ = State::CLOSING;
    cancel_timer();

    auto self = shared_from_this();

    if (!stream_.next_layer().is_open())
    {
      state_ = State::CLOSED;
      return;
    }

    stream_.async_shutdown(
    [this, self](beast::error_code ec)
    {
      if (ec == net::error::eof ||
          ec == net::error::operation_aborted ||
          ec == beast::error::timeout ||
          ec == net::error::not_connected)
      {
        state_ = State::CLOSED;
        return;
      }

      if (ec)
      {
        std::cerr << "Shutdown error: " << ec.message() << std::endl;
      }

      beast::error_code err;
      if (stream_.next_layer().is_open())
      {
        stream_.next_layer().shutdown(tcp::socket::shutdown_both, err);
        stream_.next_layer().close(err);
      }
      
      state_ = State::CLOSED;
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
      res.set(http::field::connection, "keep-alive");
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
    res.set(http::field::connection, "keep-alive");
    return res;
  }

  Session::Session(tcp::socket socket) : socket_(std::move(socket)) {}
  void Session::run()
  {
    do_read();
  }

  /**
   * Close the connection with the client.
   */
  void Session::do_close()
  {
    if (closed_) return;
    closed_ = true;

    auto self(shared_from_this());
    beast::error_code ec;

    if (socket_.is_open())
    {
      socket_.shutdown(tcp::socket::shutdown_send, ec);

      if (ec && ec != beast::errc::not_connected)
      {
        std::cerr << "Shutdown error: " << ec.message() << std::endl;
      }
    }

    socket_.close(ec);
    if (ec && ec != beast::errc::not_connected)
    {
      std::cerr << "Close error: " << ec.message() << std::endl;
    }
  }

  /**
   * Read a request from the client.
   */
  void Session::do_read()
  {
    if (closed_) return;

    buffer_.consume(buffer_.size());
    req_ = {};

    auto self(shared_from_this());

    http::async_read(socket_, buffer_, req_, 
      [this, self](beast::error_code ec, std::size_t)
      {
        if (ec == http::error::end_of_stream ||
            ec == net::error::connection_reset ||
            ec == net::error::operation_aborted ||
            ec == net::error::connection_aborted)
        {
          return do_close();
        }

        if (ec) {
          std::cerr << "Read error: " << ec.message() << std::endl;
          return do_close();
        }
        
        boost::asio::ip::address ip_address = socket_.remote_endpoint().address();
        std::string ip_str = ip_address.to_string();
        http::response<http::string_body> res = handle_request(req_, ip_str);
        do_write(std::move(res));
    });
  }

  /**
   * Write a response to the client.
   * @param res Response to write.
   */
  void Session::do_write(http::response<http::string_body> res)
  {
    if (closed_) return;

    auto self(shared_from_this());
    auto sp = std::make_shared<http::response<http::string_body>>(std::move(res));

    if (req_.keep_alive()) {
      sp->set(http::field::connection, "keep-alive");
    }

    http::async_write(socket_, * sp, [this, self, sp](beast::error_code ec, std::size_t)
    {
      if (ec)
      {
        std::cerr << "Write error: " << ec.message() << std::endl;
        return do_close();
      }
      if (!req_.keep_alive())
      {
        return do_close();
      }
      if (sp->need_eof())
      {
        return do_close();
      }
      do_read();
    });
  }
  
  Listener::Listener(net::io_context & ioc, tcp::endpoint endpoint) : ioc_(ioc),
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

    acceptor_.set_option(net::socket_base::receive_buffer_size(65536), ec);
    if (ec)
    {
      std::cerr << "Set receive buffer size error: " << ec.message() << std::endl;
      return;
    }

    acceptor_.set_option(net::socket_base::send_buffer_size(65536), ec);
    if (ec)
    {
      std::cerr << "Set send buffer size error: " << ec.message() << std::endl;
      return;
    }

    acceptor_.set_option(net::socket_base::reuse_address(true), ec);
    if (ec)
    {
      std::cerr << "Set reuse address error: " << ec.message() << std::endl;
      return;
    }

    acceptor_.set_option(tcp::no_delay(true), ec);
    if (ec)
    {
      std::cerr << "Set no delay error: " << ec.message() << std::endl;
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
        if (READER_SERVER_DEV == "true") {
          std::make_shared<Session>(std::move(socket))->run();
        } else {
          std::make_shared<SSLSession>(std::move(socket), ctx_)->run();
        }
      }
      do_accept();
    });
  }
}