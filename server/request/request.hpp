#ifndef REQUEST_HPP
#define REQUEST_HPP

#include <boost/beast/http.hpp>
#include <pqxx/pqxx>
#include <nlohmann/json.hpp>
#include <boost/beast/http.hpp>
#include <string>
#include <string_view>
#include <map>
#include <optional>
#include <iostream>
#include <chrono>
#include <unordered_map>

#include "postgres.hpp"
#include "redis.hpp"

namespace http = boost::beast::http;

namespace request
{
  struct QueryParameter
  {
    std::string key;
    std::string value;
    size_t max_size = 255;
    
    QueryParameter(std::string k, std::string v, size_t ms = 255) 
      : key(std::move(k)), value(std::move(v)), max_size(ms) {}
  };

  pqxx::result execute_query(const std::string & query, const std::vector<QueryParameter> & params);
  
  std::string_view get_session_id_from_cookie(const http::request<http::string_body>& req);
  int get_user_id_from_session(std::string session_id, bool verbose);
  bool invalidate_session(std::string session_id, bool verbose);
  bool validate_session(std::string session_id, bool verbose);

  std::map<std::string, std::string> parse_query_string(std::string_view query);
  std::optional<std::string> parse_from_request(const http::request<http::string_body>& req, const std::string& parameter);

  /* request responses */
  http::response<http::string_body> make_unauthorized_response(const std::string& message, const http::request<http::string_body>& req);
  http::response<http::string_body> make_bad_request_response(const std::string& message, const http::request<http::string_body>& req);
  http::response<http::string_body> make_too_many_requests_response(const std::string& message, const http::request<http::string_body>& req);
  http::response<http::string_body> make_ok_request_response(const std::string& message, const http::request<http::string_body>& req);
  http::response<http::string_body> make_user_request_response(const nlohmann::json& user_info, const http::request<http::string_body>& req);
}
#endif