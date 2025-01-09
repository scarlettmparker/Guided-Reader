#include "server.hpp"
#include "request/redis.hpp"
#include "request/postgres.hpp"
#include "config.h"

int main()
{
  try
  {
    auto const address = net::ip::make_address("0.0.0.0");
    unsigned short port = 443;

    net::io_context ioc;
    std::vector<std::thread> threads;

    auto listener = std::make_shared<server::Listener>(ioc, tcp::endpoint{address, port});

    /**
     * Initialize PostgreSQL connection.
     */
    postgres::init_connection();

    /**
     * Initialize Redis connection.
     */
    Redis::init_connection();
    
    std::cout << "Server started on " << address << ":" << port << std::endl;
    
    for (std::size_t i = 0; i < std::thread::hardware_concurrency(); ++i)
    {
      threads.emplace_back([&ioc] { ioc.run(); });
    }

    for (auto & t : threads)
    {
      t.join();
    }
  }
  catch (const std::exception& e)
  {
    std::cerr << "Error: " << e.what() << std::endl;
  }
}