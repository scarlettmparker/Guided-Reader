#include "api.hpp"
#include "../auth/httpclient.hpp"
#include "../auth/session.hpp"
#include <boost/beast/core.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/ssl.hpp>

namespace beast = boost::beast;
using namespace postgres;

class DiscordHandler : public RequestHandler
{
  private:
  ConnectionPool & pool;
  
  /**
   * Make a request to Discord to get an access token.
   * This is used to authenticate the user with Discord and make further requests,
   * such as getting the user's data and ensuring they are part of the Greek Learning guild.
   *
   * @param code OAuth code from Discord.
   * @param verbose Whether to print messages to stdout.
   * @return JSON response from Discord.
   */
  std::string make_discord_token_request(const std::string & code, bool verbose)
  {
    std::string body =
      "client_id=" + std::string(READER_DISCORD_CLIENT_ID) +
      "&client_secret=" + std::string(READER_DISCORD_CLIENT_SECRET) +
      "&grant_type=authorization_code" +
      "&code=" + code +
      "&redirect_uri=" + std::string(READER_DISCORD_REDIRECT_URI);

    try
    {
      httpclient::HTTPClient client{"discord.com", "443", true};
      client.set_content_type("application/x-www-form-urlencoded");
      return client.post(READER_DISCORD_TOKEN_URL, body);
    }
    catch (const std::exception & e)
    {
      verbose && std::cerr << "Failed to make Discord token request: " << e.what() << std::endl;
      return "";
    }
  }

  /**
   * Make a request to Discord to get user data. This is used to get the user's Discord ID,
   * username, avatar, and nickname. This data is used to create a new user in the database,
   * or to verify the user's identity if they are already registered.
   */
  std::string get_discord_user_data(const std::string & access_token, bool verbose)
  {
    try
    {
      httpclient::HTTPClient client{"discord.com", "443", true};
      client.set_authorization("Bearer " + access_token);
      return client.get(READER_DISCORD_USER_URL);
    }
    catch (const std::exception & e)
    {
      verbose && std::cerr << "Failed to get Discord user data: " << e.what() << std::endl;
      return "";
    }
  }

  /**
   * Make a request to Discord to get a list of guilds the user is part of.
   * This is used to check if the user is part of the Greek Learning guild.
   *
   * @param access_token Access token to use for the request.
   * @param verbose Whether to print messages to stdout.
   * @return JSON response from Discord.
   */
  std::string make_discord_guild_request(const std::string & access_token, bool verbose)
  {
    try
    {
      httpclient::HTTPClient client{"discord.com", "443", true};
      client.set_authorization("Bearer " + access_token);
      return client.get(READER_DISCORD_USER_GUILDS_URL);
    }
    catch (const std::exception & e)
    {
      verbose && std::cerr << "Failed to get Discord guild data: " << e.what() << std::endl;
      return "";
    }
  }

  /**
   * Get a list of roles for the user in the Greek Learning guild.
   * This is used to check if the user has any proficiency roles.
   *
   * @param access_token Access token to use for the request.
   * @param verbose Whether to print messages to stdout.
   * @return JSON response from Discord.
   */
  std::string get_user_roles(const std::string & access_token, bool verbose)
  {
    std::string ROLES_URL = std::string(READER_DISCORD_USER_GUILDS_URL) + "/" + READER_GREEK_LEARNING_GUILD + "/member";
    try
    {
      httpclient::HTTPClient client{"discord.com", "443", true};
      client.set_authorization("Bearer " + access_token);
      return client.get(ROLES_URL);
    }
    catch (const std::exception & e)
    {
      verbose && std::cerr << "Failed to get Discord user roles: " << e.what() << std::endl;
      return "";
    }
  }

  /**
   * Verify the user's membership in the Greek Learning guild. This is used to check
   * if the user is part of the guild before allowing them to login/register with Discord.
   *
   * @param access_token Access token to use for the request.
   * @return Response with the result of the verification.
   */
  http::response<http::string_body> verify_guild_membership(const http::request<http::string_body> & req, const std::string & access_token)
  {
    std::string guild_response = make_discord_guild_request(access_token, false);
    if (guild_response.empty())
    {
      return request::make_bad_request_response("Failed to get Discord guild data", req);
    }

    nlohmann::json guild_json;
    try
    {
      guild_json = nlohmann::json::parse(guild_response);
    } catch (const nlohmann::json::parse_error & e)
    {
      return request::make_bad_request_response("Invalid Discord guild data response", req);
    }

    for (const auto & guild : guild_json)
    {
      if (guild.contains("id") && guild["id"].get<std::string>() == READER_GREEK_LEARNING_GUILD)
      {
        // ... make empty response for checking ...
        return http::response<http::string_body>{};
      }
    }

    return request::make_bad_request_response("User not in Greek Learning guild", req);
  }

  /**
   * Verify the user's roles in the Greek Learning guild. This is used to check
   * if the user has any proficiency roles. If they do, the roles are updated in the database.
   * TODO: Filter out roles that are not proficiency levels.
   *
   * @param user_id ID of the user to verify roles for.
   * @param access_token Access token to use for the request.
   * @return Response with the result of the verification.
   */
  http::response<http::string_body> verify_user_guild_roles(const http::request<http::string_body> & req, int user_id, const std::string & access_token)
  {
    std::string user_roles = get_user_roles(access_token, false);
    if (user_roles.empty())
    {
      return request::make_bad_request_response("Failed to get Discord user roles", req);
    }

    nlohmann::json roles_json;
    try
    {
      roles_json = nlohmann::json::parse(user_roles);
    } catch (const nlohmann::json::parse_error & e)
    {
      return request::make_bad_request_response("Invalid Discord user roles response", req);
    }

    // ... get the user's roles and update them in the database ...
    std::vector<std::string> roles;
    for (const auto & role : roles_json["roles"])
    {
      roles.push_back(role.get<std::string>());
    }
    if (roles.empty())
    {
      return request::make_bad_request_response("User has no roles", req);
    }
    if (!update_user_roles(user_id, roles, false))
    {
      return request::make_bad_request_response("Failed to update user roles", req);
    }

    // ... update the user's data with the avatar and nickname ...
    std::string avatar;
    try
    {
      avatar = roles_json["avatar"].get<std::string>();
    }
    catch (const nlohmann::json::type_error & e)
    {
      try
      {
        avatar = roles_json["user"]["avatar"].get<std::string>();
      }
      catch (const nlohmann::json::type_error & e)
      {
        avatar = "-1";
      }
    }

    std::string nickname;
    try
    {
      nickname = roles_json["nick"].get<std::string>();
    }
    catch (const nlohmann::json::type_error & e)
    {
      nickname = roles_json["user"]["global_name"].get<std::string>();
    }

    if (!update_user_data(user_id, avatar, nickname, false))
    {
      return request::make_bad_request_response("Failed to update user data", req);
    }

    return http::response<http::string_body>{};
  }

  /**
   * Update a user's roles in the database. This is used to check what proficiency
   * level the user has on the front-end. It stores a list of role IDs taken from
   * the Discord API.
   *
   * @param user_id ID of the user to update.
   * @param roles List of role IDs to update.
   * @param verbose Whether to print messages to stdout.
   * @return true if the roles were updated, false otherwise.
   */
  bool update_user_roles(int user_id, const std::vector<std::string> & roles, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);

      std::ostringstream oss;
      oss << "{";
      for (size_t i = 0; i < roles.size(); ++i)
      {
        if (i > 0)
          oss << ",";
        oss << txn.quote(roles[i]);
      }
      oss << "}";

      pqxx::result r = txn.exec_prepared(
        "update_user_roles",
        user_id,
        oss.str()
      );
      txn.commit();
      return true;
    }
    catch (const std::exception & e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    } catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
  }

  /**
   * Update a user's data in the database. This is used to update the user's avatar
   * and nickname from Discord. It uses the avatar and nickname from the Greek
   * learning guild in case they are different from the user's Discord account.
   *
   * @param user_id ID of the user to update.
   * @param avatar Avatar URL to update.
   * @param nickname Nickname to update.
   * @param verbose Whether to print messages to stdout.
   * @return true if the data was updated, false otherwise.
   */
  bool update_user_data(int user_id, const std::string & avatar, const std::string & nickname, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "update_user_data",
        user_id,
        avatar,
        nickname
      );
      txn.commit();
      return true;
    }
    catch (const std::exception & e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    } catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
    return false;
  }

  /**
   * Select the user ID by Discord ID.
   *
   * @param discord_id Discord ID to select.
   * @param verbose Whether to print messages to stdout.
   * @return ID of the user if found, -1 otherwise.
   */
  int select_user_id_by_discord_id(const std::string & discord_id, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      pqxx::result r = txn.exec_prepared(
        "select_user_id_by_discord_id", discord_id
      );
      txn.commit();

      if (r.empty())
      {
        verbose && std::cout << "User with Discord ID " << discord_id << " not found" << std::endl;
        return -1;
      }
      return r[0][0].as<int>();
    }
    catch (const std::exception & e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    } catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
    return -1;
  }

  /**
   * Validate or invalidate a user's Discord status. This is used to remove the
   * user's connection to Discord if they are not in the Greek Learning guild.
   * 
   * @param user_id ID of the user to validate/invalidate.
   * @param validate Whether to validate or invalidate the user's status.
   * @param verbose Whether to print messages to stdout.
   * @return true if the status was updated, false otherwise.
   */
  bool validate_discord_status(int user_id, bool validate, bool verbose)
  {
    try
    {
      pqxx::work & txn = request::begin_transaction(pool);
      if (validate)
      {
        pqxx::result r = txn.exec_prepared(
          "validate_discord_status",
          user_id
        );
      }
      else
      {
        pqxx::result r = txn.exec_prepared(
          "invalidate_discord_status",
          user_id
        );
      }
      txn.commit();
      return true;
    }
    catch (const std::exception & e)
    {
      verbose && std::cerr << "Error executing query: " << e.what() << std::endl;
    } catch (...)
    {
      verbose && std::cerr << "Unknown error while executing query" << std::endl;
    }
    return false;
  }

  public:
  DiscordHandler(ConnectionPool& connection_pool) : pool(connection_pool) {}

  std::string get_endpoint() const override
  {
    return "/discord";
  }

  http::response<http::string_body> handle_request(const http::request<http::string_body> & req, const std::string & ip_address)
  {
    if (req.method() == http::verb::post)
    {
      /**
       * Login/Register with Discord account.
       */
      nlohmann::json json_request;
      try
      {
        json_request = nlohmann::json::parse(req.body());
      } catch (const nlohmann::json::parse_error & e)
      {
        return request::make_bad_request_response("Invalid JSON", req);
      }
      if (!json_request.contains("code"))
      {
        return request::make_bad_request_response("Missing Discord OAuth code", req);
      }

      // ... attempt to get token from Discord ...
      std::string code = json_request["code"].get<std::string>();
      std::string token_response = make_discord_token_request(code, false);

      if (token_response.empty())
      {
        return request::make_bad_request_response("Failed to get Discord token", req);
      }

      nlohmann::json token_json;
      try
      {
        token_json = nlohmann::json::parse(token_response);
      } catch (const nlohmann::json::parse_error & e)
      {
        return request::make_bad_request_response("Invalid Discord token response", req);
      }
      if (!token_json.contains("access_token"))
      {
        return request::make_bad_request_response("Missing Discord access token", req);
      }

      std::string access_token = token_json["access_token"].get<std::string>();
      std::string token_type = token_json["token_type"].get<std::string>();
      
      // ... attempt to get user data from Discord ...
      std::string user_data_response = get_discord_user_data(access_token, false);
      if (user_data_response.empty())
      {
        return request::make_bad_request_response("Failed to get Discord user data", req);
      }

      nlohmann::json user_data_json;
      try
      {
        user_data_json = nlohmann::json::parse(user_data_response);
      } catch (const nlohmann::json::parse_error & e)
      {
        return request::make_bad_request_response("Invalid Discord user data response", req);
      }

      if (!user_data_json.contains("id") || !user_data_json.contains("username") || !user_data_json.contains("avatar"))
      {
        return request::make_bad_request_response("Missing Discord user data", req);
      }

      std::string discord_id = user_data_json["id"].get<std::string>();

      // ... check if Discord id is already linked to an account ...
      int user_id = select_user_id_by_discord_id(discord_id, false);
      if (user_id == -1)
      {
        // ... register user ... (make endpoint later for this)
        // ... make sure to check that the user is in greek learning guild ...
        return request::make_bad_request_response("User not found", req);
      }

      // ... otherwise, login user ...
      // ... make sure to check that the user is in greek learning guild ...
      http::response<http::string_body> guild_response = verify_guild_membership(req, access_token);
      if (guild_response.result() != http::status::ok)
      {
        validate_discord_status(user_id, false, false);
        return guild_response;
      }

      // ... check the user's roles in the guild ...
      http::response<http::string_body> role_response = verify_user_guild_roles(req, user_id, access_token);
      if (role_response.result() != http::status::ok)
      {
        validate_discord_status(user_id, false, false);
        return role_response;
      }

      validate_discord_status(user_id, true, false);

      // ... generate the session to log in the user ...
      std::string session_id = session::generate_session_id(false);
      std::string signed_session_id = session_id + "." + session::generate_hmac(session_id, READER_SECRET_KEY);
      int expires_in = std::stoi(READER_SESSION_EXPIRE_LENGTH);
      
      if (!session::set_session_id(signed_session_id, user_id, expires_in, ip_address, false))
      {
        return request::make_bad_request_response("Failed to set session ID", req);
      }
      return session::set_session_cookie(signed_session_id);
    }
    else if (req.method() == http::verb::patch)
    {
      /**
       * Link account with Discord.
       */
    }
    else if (req.method() == http::verb::delete_)
    {
      /**
       * Unlink account from Discord.
       */
    }
    else
    {
      return request::make_bad_request_response("Invalid method", req);
    }
  }
};

extern "C" RequestHandler* create_discord_handler()
{
  return new DiscordHandler(get_connection_pool());
}