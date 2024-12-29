#include "api.hpp"

using namespace postgres;
class LogoutHandler : public RequestHandler
{
  public:
  std::string get_endpoint() const override
  {
    return "/logout";
  }

  http::response<http::string_body> handle_request(http::request<http::string_body> const & req, const std::string & ip_address)
  {
    if (req.method() == http::verb::post)
    {
      /**
       * Logout user.
       */

      nlohmann::json json_request;
      try
      {
        json_request = nlohmann::json::parse(req.body());
      }
      catch (const nlohmann::json::parse_error& e)
      {
        return request::make_bad_request_response("Invalid JSON request", req);
      }

      if (!json_request.contains("user_id"))
      {
        return request::make_bad_request_response("Invalid user id parameters", req);
      }

      const int user_id = json_request["user_id"];
      std::string_view session_id = request::get_session_id_from_cookie(req);
      if (session_id.empty())
      {
        return request::make_unauthorized_response("Invalid or expired session", req);
      }

      if (request::get_user_id_from_session(std::string(session_id), true) != user_id)
      {
        return request::make_unauthorized_response("Session id does not match user id!", req);
      }

      if (!request::invalidate_session(std::string(session_id), true))
      {
        return request::make_bad_request_response("Failed to invalidate session", req);
      }

      return request::make_ok_request_response("Successfully logged out", req);
    }
    else
    {
      return request::make_bad_request_response("Invalid request method", req);
    }
  }
};

extern "C" RequestHandler* create_logout_handler()
{
  return new LogoutHandler();
}