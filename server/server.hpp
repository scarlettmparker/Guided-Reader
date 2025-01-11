#ifndef SERVER_HPP
#define SERVER_HPP

#pragma once
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/ssl/stream.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/strand.hpp>
#include <boost/config.hpp>
#include <boost/asio/ssl.hpp>

#include <filesystem>
#include <dlfcn.h>
#include <vector>
#include <iostream>
#include <memory>
#include <optional>
#include <string>
#include <thread>
#include <map>

#include "config.h"
#include "request/request_handler.hpp"
#include "request/postgres.hpp"
#include "sslstream.hpp"

namespace beast = boost::beast;
namespace http = beast::http;
namespace net = boost::asio;
namespace ssl = boost::asio::ssl;
using tcp = net::ip::tcp;

namespace server {
  const int READ_TIMEOUT_SECONDS = 30;
  const int WRITE_TIMEOUT_SECONDS = 30;
  const int HANDSHAKE_TIMEOUT_SECONDS = 30;
  std::vector<std::unique_ptr<RequestHandler>> load_handlers(const std::string& directory);
  http::response<http::string_body> handle_request(http::request<http::string_body> const& req, const std::string& ip_address);
  
  class SSLSession : public std::enable_shared_from_this<SSLSession>
  {
    public:
      explicit SSLSession(tcp::socket socket, ssl::context& ctx);
      void run();
    
    private:
      enum class State
      {
        HANDSHAKE,
        READING,
        WRITING,
        CLOSING,
        CLOSED
      };

      ssl::stream<tcp::socket> stream_;
      beast::flat_buffer buffer_;
      http::request<http::string_body> req_;
      net::steady_timer timer_;
      State state_{State::HANDSHAKE};
      bool timer_cancelled_{false};

      void cancel_timer();
      void do_handshake();
      void do_read();
      void do_write(http::response<http::string_body> res);
      void do_close();
  };

  class Session : public std::enable_shared_from_this<Session>
  {
    tcp::socket socket_;
    beast::flat_buffer buffer_;
    http::request<http::string_body> req_;
    bool closed_ = false;

    public:
      explicit Session(tcp::socket socket);
      void run();

    private:
      void do_close();
      void do_read();
      void do_write(http::response<http::string_body> res);
  };

  class Listener : public std::enable_shared_from_this<Listener>
  {
    net::io_context& ioc_;
    tcp::acceptor acceptor_;
    ssl::context ctx_;

    public:
      Listener(net::io_context& ioc, tcp::endpoint endpoint);
      void do_accept();
  };
}

#endif