#include "middleware.hpp"

namespace middleware
{
  std::mutex rate_limit_mutex;
  std::unordered_map<CacheKey, RateLimitData> rate_limit_cache;

  /**
   * Check if a user has the required permissions.
   * This function checks if the user has one of the required permissions to access a resource.
   *
   * @param user_permissions Permissions the user has.
   * @param required_permissions Permissions required to access the resource.
   * @param num_permissions Number of permissions required.
   * @return true if the user has the required permissions, false otherwise.
   */
  /* int check_permissions(request::UserPermissions permissions, std::string * required_permissions, int num_permissions)
  {
    std::unordered_set<std::string> permission_set;
    for (int i = 0; i < permissions.permission_count; i++)
    {
      if (permissions.permissions[i].permission_name == "*")
      {
        return true;
      }
      permission_set.insert(permissions.permissions[i].permission_name);
    }
    
    for (int i = 0; i < num_permissions; i++)
    {
      if (permission_set.find(required_permissions[i]) != permission_set.end())
      {
        return true;
      }
    }
    return true;
  } */

  /**
   * Check if a user is being rate limited.
   * This works by checking if enough milliseconds have passed since the last request.
   *
   * @param ip_address IP address of the user to check.
   * @param endpoint The API endpoint being accessed
   * @param window_ms Time window in milliseconds between allowed requests
   * @return true if the user is rate limited, false otherwise.
   */
  bool rate_limited(const std::string & ip_address, const std::string & endpoint, int window_ms)
  {
    std::lock_guard<std::mutex> guard(rate_limit_mutex);
    auto now = std::chrono::system_clock::now();
    CacheKey key{ip_address, endpoint};
    auto& data = rate_limit_cache[key];

    if (data.last_request.time_since_epoch().count() == 0)
    {
      data.last_request = now;
      return false;
    }

    // ... check that enough time has passed since last requests ...
    auto seconds_since_last = std::chrono::duration_cast<std::chrono::milliseconds>
      (now - data.last_request).count();    
    if (seconds_since_last < window_ms)
    {
      return true;
    }

    data.last_request = now;
    return false;
  }
}