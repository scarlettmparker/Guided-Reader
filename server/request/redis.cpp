#include "redis.hpp"

std::unique_ptr<sw::redis::Redis> Redis::instance_ = nullptr;

void Redis::init_connection()
{
  if (!instance_)
  {
    instance_ = std::make_unique<sw::redis::Redis>(
      "tcp://" 
      + std::string(READER_REDIS_HOST) + ":"
      + std::string(READER_REDIS_PORT)
    );
    std::cout << "Connected to Redis server" << std::endl;
  }
}

sw::redis::Redis & Redis::get_instance()
{
  if (!instance_)
  {
    throw std::runtime_error("Redis instance not initialized");
  }
  return *instance_;
}