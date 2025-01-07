#include "api.hpp"
#include "bcrypt/BCrypt.hpp"
#include "../auth/session.hpp"
#include "../request/redis.hpp"

#include <openssl/rand.h>
#include <ctime>

using namespace postgres;
class UserHandler : public RequestHandler
{
  private:
  ConnectionPool & pool;

  struct UserData
  {
    std::string username;
    std::string discord_id;
    std::string avatar;
    std::string nickname;
  };

  /**
   * Select the ID of a user by username.
   * @param username Username of the user to select.
   * @param verbose Whether to print messages to stdout.
   * @return ID of the user if found, -1 otherwise.
   */
  int select_user_id(std::string username, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "select_user_id", username
      );
      txn.commit();

      if (r.empty())
      {
        verbose && std::cout << "User with username " << username << " not found" << std::endl;
        return -1;
      }
      return r[0][0].as<int>();
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    } catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
    return -1;
  }

  /**
   * Select user data by ID. This returns the username, Discord ID, avatar, and nickname of the user.
   * @param id ID of the user to select.
   * @param verbose Whether to print messages to stdout.
   * @return UserData struct with the user data if found, otherwise an object of empty strings.
   */
  UserData select_user_data_by_id(int id, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "select_user_data_by_id", id
      );
      txn.commit();

      if (r.empty())
      {
        verbose && std::cout << "User with ID " << id << " not found" << std::endl;
        return UserData{"", "", "", ""};
      }

      return UserData
      {
        r[0][0].as<std::string>(),
        r[0][1].as<std::string>(),
        r[0][2].as<std::string>(),
        r[0][3].as<std::string>()
      };
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    } catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
    return UserData{"", "", "", ""};
  }

  /**
   * Select a user by ID.
   * @param id ID of the user to select.
   * @param verbose Whether to print messages to stdout.
   * @return Username of the user if found, NULL otherwise.
   */
  std::string select_username_by_id(int id, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "select_username_by_id", id
      );
      txn.commit();

      if (r.empty())
      {
        verbose && std::cout << "User with ID " << id << " not found" << std::endl;
        return "";
      }
      return r[0][0].c_str();
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
      return "";
    } catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
      return "";
    }
    return "";
  }
  
  /**
   * Select the password of a user by username.
   * @param username Username of the user to select.
   * @param verbose Whether to print messages to stdout.
   * @return (Hashed) password of the user if found, NULL otherwise.
   */
  std::string select_password(std::string username, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "select_user_password", username
      );
      txn.commit();

      if (r.empty())
      {
        verbose && std::cout << "User with username " << username << " not found" << std::endl;
        return "";
      }
      return r[0][0].c_str();
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
      return "";
    } catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
      return "";
    }
    return "";
  }

  /**
   * Register a new user with a username and password (non-Discord connected).
   * As user is not connected with Discord, levels is set to {-1} and the discordId to -1.
   * 
   * @param username Username of the user to register.
   * @param hashed_password Hashed password of the user to register.
   * @param verbose Whether to print messages to stdout.
   * @return true if the user was registered, false otherwise.
   */
  bool register_user(std::string username, std::string hashed_password, bool verbose)
  {
    try
    {
      int current_time = static_cast<int>(std::time(0));   
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "insert_user",
        username, hashed_password, current_time
      );
      txn.commit();
      
      return true;
    }
    catch (const std::exception &e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
      return false;
    } catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
      return false;
    }
  }

  /**
   * Authenticate a user with a username and password.
   * This function uses BCrypt to validate the password against the hashed password stored in the database.
   *
   * @param username Username of the user to authenticate.
   * @param password Password of the user to authenticate.
   * @param verbose Whether to print messages to stdout.
   * @return true if the user is authenticated, false otherwise.
   */
  bool login(std::string username, std::string password)
  {
    std::string stored_password = select_password(username, false);
    if (stored_password.empty())
    {
      return false;
    }
    return BCrypt::validatePassword(password, stored_password);
  }

  public:
  UserHandler(ConnectionPool& connection_pool) : pool(connection_pool) {}

  std::string get_endpoint() const override
  {
    return "/user";
  }

  http::response<http::string_body> handle_request(const http::request<http::string_body> & req, const std::string & ip_address)
  {
    if (req.method() == http::verb::get)
    {
      /**
       * GET user information.
       */

      std::string_view session_id = request::get_session_id_from_cookie(req);
      if (session_id.empty())
      {
        return request::make_unauthorized_response("Session ID not found", req);
      }
 
      if (!request::validate_session(std::string(session_id), false))
      {
        return request::make_unauthorized_response("Invalid session ID", req);
      }

      int user_id = request::get_user_id_from_session(std::string(session_id), false);
      if (user_id == -1)
      {
        return request::make_bad_request_response("User not found", req);
      }

      UserData user_data = select_user_data_by_id(user_id, false);
      if (user_data.username.empty())
      {
        return request::make_bad_request_response("User not found", req);
      }
      
      nlohmann::json user_info =
      {
        {"id", user_id},
        {"username", user_data.username},
        {"discord_id", user_data.discord_id},
        {"avatar", user_data.avatar},
        {"nickname", user_data.nickname}
      };

      return request::make_json_request_response(user_info, req);
    }
    else if (req.method() == http::verb::post)
    {
      /**
       * Login user.
       */

      nlohmann::json json_request;
      try
      {
        json_request = nlohmann::json::parse(req.body());
      } catch (const nlohmann::json::parse_error & e)
      {
        return request::make_bad_request_response("Invalid JSON", req);
      }

      if (!json_request.contains("username") || !json_request.contains("password"))
      {
        return request::make_bad_request_response("Missing username or password", req);
      }

      if (!json_request["username"].is_string() || !json_request["password"].is_string())
      {
        return request::make_bad_request_response("Invalid username or password", req);
      }

      std::string username = json_request["username"].get<std::string>();
      std::string password = json_request["password"].get<std::string>();

      if (!login(username, password) || password.empty())
      {
        return request::make_unauthorized_response("Invalid username or password", req);
      }

      std::string session_id = session::generate_session_id(false);
      std::string signed_session_id = session_id + "." + session::generate_hmac(session_id, READER_SECRET_KEY);
      int user_id = select_user_id(username, false);

      if (user_id == -1)
      {
        return request::make_bad_request_response("User not found", req);
      }

      int expires_in = std::stoi(READER_SESSION_EXPIRE_LENGTH);
      if (!session::set_session_id(signed_session_id, user_id, expires_in, ip_address, false))
      {
        return request::make_bad_request_response("Failed to set session ID", req);
      }

      return session::set_session_cookie(signed_session_id);
    }
    else if (req.method() == http::verb::put)
    {
      /**
       * PUT new user.
       */

      nlohmann::json json_request;
      try
      {
        json_request = nlohmann::json::parse(req.body());
      } catch (const nlohmann::json::parse_error &e)
      {
        return request::make_bad_request_response("Invalid JSON", req);
      }

      if (!json_request.contains("username") || !json_request.contains("password"))
      {
        return request::make_bad_request_response("Missing username or password", req);
      }

      if (!json_request["username"].is_string() || !json_request["password"].is_string())
      {
        return request::make_bad_request_response("Invalid username or password", req);
      }

      std::string username = json_request["username"].get<std::string>();
      std::string password = json_request["password"].get<std::string>();

      if (select_user_id(username, false) != -1)
      {
        return request::make_bad_request_response("Username taken", req);
      }

      std::string hashed_password = BCrypt::generateHash(password);
      if (hashed_password.empty())
      {
        return request::make_bad_request_response("Failed to hash password", req);
      }

      if (!register_user(username, hashed_password, false))
      {
        return request::make_bad_request_response("Failed to register user", req);
      }

      return request::make_ok_request_response("User registered", req);
    }
    else if (req.method() == http::verb::patch)
    {
      /**
       * Update user information.
       */
    }
    else if (req.method() == http::verb::delete_)
    {
      /**
       * DELETE user.
       */
    }
    else 
    {
      return request::make_bad_request_response("Invalid request method", req);
    }
  }
};

extern "C" RequestHandler* create_user_handler()
{
  return new UserHandler(get_connection_pool());
}