#include "api.hpp"

using namespace postgres;
class LastModifiedHandler : public RequestHandler {
  private:
  ConnectionPool & pool;

  static std::string build_query(const std::string& table_name) {
    return "SELECT last_modified FROM public.\"" + table_name + "\" ORDER BY last_modified DESC LIMIT 1";
  }

  /**
   * Select the last modified date of a table.
   * @param table_name Name of the table to select the last modified date from.
   * @param verbose Whether to print messages to stdout.
   * @return Last modified date of the table if found, "" otherwise.
   */
  std::string select_last_modified(const std::string& table_name, int verbose)
  {
    try
    {
      pqxx::result r = request::execute_query(pool, "SELECT last_modified FROM public.\"" 
        + table_name + "\" ORDER BY last_modified DESC LIMIT 1", {});

      if (r.empty())
      {
        verbose && std::cerr << "Table " << table_name << " not found" << std::endl;
        return "";
      }
      
      return r[0][0].c_str();
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    }
    return "";
  }

  public:
  LastModifiedHandler(ConnectionPool& connection_pool) : pool(connection_pool) {}

  std::string get_endpoint() const override
  {
    return "/last_modified";
  }

  http::response<http::string_body> handle_request(http::request<http::string_body> const& req, const std::string& ip_address)
  {
    if (middleware::rate_limited(ip_address))
    {
      return request::make_too_many_requests_response("Too many requests", req);
    }

    if (req.method() == http::verb::get)
    {
      /**
       * GET last modified.
       */

      nlohmann::json json_request;
      try
      {
        json_request = nlohmann::json::parse(req.body());
      }
      catch (const nlohmann::json::parse_error &e)
      {
        return request::make_bad_request_response("Invalid JSON", req);
      }

      if (!json_request.contains("table"))
      {
        return request::make_bad_request_response("Invalid request: Missing required field (table).", req);
      }

      std::string table = json_request["table"].get<std::string>();
      std::string last_modified = select_last_modified(table, 0);

      if (last_modified.empty())
      {
        return request::make_bad_request_response("Table not found", req);
      }

      nlohmann::json response_json;
      response_json["message"] = "Last modified date found successfully";
      response_json["last_modified"] = last_modified;
      return request::make_ok_request_response(response_json.dump(4), req);
    }
    else
    {
      return request::make_bad_request_response("Invalid method", req);
    }
  }
};

extern "C" RequestHandler* create_last_modified_handler()
{
  return new LastModifiedHandler(get_connection_pool());
}