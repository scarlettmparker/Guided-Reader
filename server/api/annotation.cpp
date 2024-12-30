#include "api.hpp"

using namespace postgres;
class AnnotationHandler : public RequestHandler
{
  private:
  ConnectionPool & pool;

  /**
   * Select annotation data from the database. This will return the annotation ID,
   * annotation description, dislikes, likes, creation date and author ID of the annotations
   * at a given starting and ending point in the text (assuming there are matches).
   *
   * @param text_id ID of the text to select annotations from.
   * @param start Start position of the annotation.
   * @param end End position of the annotation.
   * @param verbose Whether to print messages to stdout.
   * @return JSON of annotation data.
   *
   * @example
   * int start = 5, int end = 10
   * Text data from matching text id: "Hello, world!"
   * The string ", worl" is annotated (characters 5-10) in the text, and is
   * described with "example description". This function would return:
   *
   * [
   *   {
   *     "id": 1,
   *     "description": "example description",
   *     "dislikes": 0,
   *     "likes": 0,
   *     "created_at": 1045785600,
   *     "user_id": 1
   *   }
   * ]
   *
   * Multiple annotations may be returned if there are multiple
   * annotations within the given range.
   */
  nlohmann::json select_annotation_data(int text_id, int start, int end, bool verbose)
  {
    nlohmann::json annotation_info = nlohmann::json::array();

    try
    {
      pqxx::work & txn = request::begin_transaction(pool);

      pqxx::result r = txn.exec_prepared(
        "select_annotation_data",
        std::to_string(text_id), std::to_string(start), std::to_string(end)
      );

      
      txn.commit();

      if (r.empty())
      {
        verbose && std::cout << "No annotations found" << std::endl;
        return annotation_info;
      }

      annotation_info = nlohmann::json::parse(r[0][0].as<std::string>());
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    }
    catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
    return annotation_info;
  }

  public:
  AnnotationHandler(ConnectionPool & connection_pool) : pool(connection_pool) {}

  std::string get_endpoint() const override
  {
    return "/annotation";
  }

  http::response<http::string_body> handle_request(http::request<http::string_body> const & req, const std::string & ip_address)
  {
    if (req.method() == http::verb::get)
    {
      /**
       * GET annotation details.
       */
      std::optional<std::string> text_id_param = request::parse_from_request(req, "text_id");
      std::optional<std::string> annotation_start_param = request::parse_from_request(req, "start");
      std::optional<std::string> annotation_end_param = request::parse_from_request(req, "end");

      if (!annotation_start_param || !annotation_end_param)
      {
        return request::make_bad_request_response("Missing parameters start | end", req);
      }

      int text_id, start, end;
      try
      {
        text_id = std::stoi(text_id_param.value());
        start = std::stoi(annotation_start_param.value());
        end = std::stoi(annotation_end_param.value());
      }
      catch (const std::invalid_argument&)
      {
        return request::make_bad_request_response("Invalid numeric value for text_id | start | end", req);
      }
      catch (const std::out_of_range&)
      {
        return request::make_bad_request_response("Number out of range for text_id | start | end", req);
      }

      nlohmann::json annotation_info = select_annotation_data(text_id, start, end, false);
      if (annotation_info.empty())
      {
        return request::make_bad_request_response("No annotations found", req);
      }

      return request::make_json_request_response(annotation_info, req);
    }
    else
    {
      return request::make_bad_request_response("Invalid method", req);
    }
  }
};

extern "C" RequestHandler* create_annotation_handler()
{
  return new AnnotationHandler(get_connection_pool());
}