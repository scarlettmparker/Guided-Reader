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

  /**
   * Select the author ID of an annotation by its ID.
   * This is used to validate that the user submits a valid annotation and author ID.
   * If the author ID doesn't match that in the database for the annotation, the user
   * may be trying to edit an annotation that doesn't belong to them.
   *
   * @param annotation_id ID of the annotation to select the author ID from.
   * @param verbose Whether to print messages to stdout.
   * @return Author ID of the annotation if found, -1 otherwise.
   */
  int select_author_id_by_annotation(int annotation_id, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "select_author_id_by_annotation", annotation_id
      );
      txn.commit();

      if (r.empty())
      {
        verbose && std::cout << "Annotation with ID " << annotation_id << " not found" << std::endl;
        return -1;
      }
      return r[0][0].as<int>();
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    }
    catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
    return -1;
  }

  /**
   * Update an annotation with a new description.
   *
   * @param annotation_id ID of the annotation to update.
   * @param description New description of the annotation.
   * @param verbose Whether to print messages to stdout.
   * @return true if the annotation was updated, false otherwise.
   */
  bool update_annotation(int annotation_id, std::string description, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "update_annotation",
        description, annotation_id
      );
      txn.commit();

      if (r.affected_rows() == 0)
      {
        verbose && std::cout << "Annotation with ID " << annotation_id << " not found" << std::endl;
        return false;
      }
      return true;
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    }
    catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
    return false;
  }

  /**
   * Delete an annotation by its ID.
   *
   * @param annotation_id ID of the annotation to delete.
   * @param verbose Whether to print messages to stdout.
   * @return true if the annotation was deleted, false otherwise.
   */
  bool delete_annotation(int annotation_id, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "delete_annotation",
        annotation_id
      );
      txn.commit();

      if (r.affected_rows() == 0)
      {
        verbose && std::cout << "Annotation with ID " << annotation_id << " not found" << std::endl;
        return false;
      }
      return true;
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    }
    catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
    return false;
  }

  /**
   * Helper function to validate the author of an annotation.
   * Explanation as to reasoning for this can be found above (select_author_id_by_annotation).
   *
   * @param req HTTP request to extract session ID and user ID from.
   * @param annotation_id ID of the annotation to validate.
   * @param author_id ID of the author to validate.
   * @return HTTP response if validation fails, empty OK response otherwise.
   */
  http::response<http::string_body> validate_annotation_author(const http::request<http::string_body>& req, int annotation_id, int author_id) {
    // ... validate annotation author ...
    int real_author_id = select_author_id_by_annotation(annotation_id, false);
    if (real_author_id == -1) {
        return request::make_bad_request_response("Annotation not found", req);
    }
    if (real_author_id != author_id) {
        return request::make_bad_request_response("Author ID mismatch. This incident has been reported", req);
    }

    // ... validate session and user
    std::string_view session_id = request::get_session_id_from_cookie(req);
    if (session_id.empty()) {
        return request::make_unauthorized_response("Session ID not found", req);
    }
    if (!request::validate_session(std::string(session_id), false)) {
        return request::make_unauthorized_response("Invalid session ID", req);
    }

    int user_id = request::get_user_id_from_session(std::string(session_id), false);
    if (user_id == -1) {
        return request::make_bad_request_response("User not found", req);
    }
    if (user_id != real_author_id) {
        return request::make_bad_request_response("Author ID mismatch. This incident has been reported", req);
    }

    return http::response<http::string_body>{http::status::ok, req.version()};
  }

  public:
  AnnotationHandler(ConnectionPool & connection_pool) : pool(connection_pool) {}

  std::string get_endpoint() const override
  {
    return "/annotation";
  }

  http::response<http::string_body> handle_request(const http::request<http::string_body> & req, const std::string & ip_address)
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
    else if (req.method() == http::verb::patch)
    {
      /**
       * UPDATE annotation details.
       */

      nlohmann::json json_request;
      try
      {
        json_request = nlohmann::json::parse(req.body());
      } catch (const nlohmann::json::parse_error &e)
      {
        return request::make_bad_request_response("Invalid JSON", req);
      }

      int annotation_id;
      int author_id;
      std::string description;

      try
      {
        author_id = json_request["author"]["id"].get<int>();
        annotation_id = json_request["annotation"]["id"].get<int>();
        description = json_request["description"].get<std::string>();
      }
      catch (const nlohmann::json::exception &e)
      {
        return request::make_bad_request_response("Missing author.id | annotation.id | description", req);
      }
      catch (const std::invalid_argument&)
      {
        return request::make_bad_request_response("Invalid numeric value for author.id | annotation.id", req);
      }
      catch (const std::out_of_range&)
      {
        return request::make_bad_request_response("Number out of range for author.id | annotation.id", req);
      }

      if (description.empty())
      {
        return request::make_bad_request_response("Missing description", req);
      }
      if (description.length() > 4000)
      {
        return request::make_bad_request_response("Description too long. Max 4,000 characters", req);
      }
      else if (description.length() < 15)
      {
        return request::make_bad_request_response("Description too short. Max 15 characters", req);
      }

      http::response<http::string_body> validation_response = validate_annotation_author(req, annotation_id, author_id);
      if (validation_response.result() != http::status::ok)
      {
        return validation_response;
      }

      if (!update_annotation(annotation_id, description, false))
      {
        return request::make_bad_request_response("Failed to update annotation", req);
      }

      return request::make_json_request_response("Annotation updated", req);
    }
    else if (req.method() == http::verb::delete_)
    {
      /**
       * DELETE annotation.
       */

      nlohmann::json json_request;
      try
      {
        json_request = nlohmann::json::parse(req.body());
      } catch (const nlohmann::json::parse_error &e)
      {
        return request::make_bad_request_response("Invalid JSON", req);
      }

      int annotation_id;
      int author_id;

      try
      {
        author_id = json_request["author"]["id"].get<int>();
        annotation_id = json_request["annotation"]["id"].get<int>();
      }
      catch (const nlohmann::json::exception &e)
      {
        return request::make_bad_request_response("Missing author.id | annotation.id", req);
      }
      catch (const std::invalid_argument&)
      {
        return request::make_bad_request_response("Invalid numeric value for author.id | annotation.id", req);
      }
      catch (const std::out_of_range&)
      {
        return request::make_bad_request_response("Number out of range for author.id | annotation.id", req);
      }

      http::response<http::string_body> validation_response = validate_annotation_author(req, annotation_id, author_id);
      if (validation_response.result() != http::status::ok)
      {
        return validation_response;
      }

      if (!delete_annotation(annotation_id, false))
      {
        return request::make_bad_request_response("Failed to delete annotation", req);
      }

      return request::make_json_request_response("Annotation deleted", req);
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