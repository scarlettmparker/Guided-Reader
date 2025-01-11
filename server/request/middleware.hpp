#ifndef MIDDLEWARE_HPP
#define MIDDLEWARE_HPP

#include <iostream>
#include <string>
#include <unordered_set>
#include <stdbool.h>

#include "request.hpp"
#include "postgres.hpp"

namespace middleware
{
  struct RateLimitData
  {
    std::chrono::system_clock::time_point last_request;
  };

  using CacheKey = std::pair<std::string, std::string>;

  extern std::mutex rate_limit_mutex;
  extern std::unordered_map<CacheKey, RateLimitData> rate_limit_cache;

  /* bool check_permissions(request::UserPermissions user_permissions, std::string * required_permissions, int num_permissions); */
  bool rate_limited(const std::string & ip_address, const std::string & endpoint, int window_ms);
  bool user_accepted_policy(const int user_id, bool verbose);
}

namespace std
{
  template<>
  struct hash<middleware::CacheKey>
  {
    size_t operator()(const middleware::CacheKey & k) const
    {
      return hash<string>()(k.first) ^ hash<string>()(k.second);
    }
  };
}

#endif