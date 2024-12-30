#include "postgres.hpp"

namespace postgres
{
  static ConnectionPool* global_pool = nullptr;
  std::unordered_map<pqxx::connection*, ConnectionMetadata> connection_metadata;

  /**
   * Create a new connection for the connection pool.
   * @return New connection.
   */
  pqxx::connection* ConnectionPool::create_new_connection()
  {
    auto c = new pqxx::connection(
      "user=" + std::string(READER_DB_USERNAME) +
      " password=" + std::string(READER_DB_PASSWORD) +
      " host=" + std::string(READER_DB_HOST) +
      " port=" + std::string(READER_DB_PORT) +
      " dbname=" + std::string(READER_DB_NAME) +
      " target_session_attrs=read-write" +
      " keepalives=1" +
      " keepalives_idle=30"
    );

    if (!c->is_open())
    {
      delete c;
      throw std::runtime_error("Failed to open PostgreSQL connection!");
    }

    pqxx::work txn(*c);

    // ... text queries ...
    txn.conn().prepare("select_text_id",
      "SELECT id "
      "FROM public.\"Text\" "
      "WHERE text_object_id = $1 "
      "AND language = $2");

    txn.conn().prepare("select_annotations",
      "SELECT array_to_json(array_agg(row_to_json(t))) "
      "FROM ("
      "  SELECT id::integer,"
      "         start::integer,"
      "         \"end\"::integer,"
      "         text_id::integer"
      "  FROM public.\"Annotation\" "
      "  WHERE text_id = $1"
      ") t");
      
    txn.conn().prepare("select_text_details",
      "SELECT array_to_json(array_agg(row_to_json(t))) "
      "FROM ("
      "  SELECT id::integer,"
      "         text::text,"
      "         language::text,"
      "         text_object_id::integer"
      "  FROM public.\"Text\" "
      "  WHERE text_object_id = $1"
      "  AND language = $2"
      ") t");

    // ... title queries ...
    txn.conn().prepare("select_titles",
      "SELECT array_to_json(array_agg(row_to_json(t))) "
      "FROM ("
      "  SELECT id::integer,"
      "         title::text,"
      "         level::text,"
      "         group_id::integer "
      "  FROM public.\"TextObject\" "
      "  WHERE id > $2 " 
      "  ORDER BY id "
      "  LIMIT $1"
      ") t");

    // ... user queries ...
    txn.conn().prepare("select_user_id",
      "SELECT id "
      "FROM public.\"User\" "
      "WHERE username = $1 "
      "LIMIT 1");

    txn.conn().prepare("select_user_data_by_id",
      "SELECT username, discord_id, avatar, nickname "
      "FROM public.\"User\" "
      "WHERE id = $1 "
      "LIMIT 1");

    txn.conn().prepare("select_username_by_id",
      "SELECT username "
      "FROM public.\"User\" "
      "WHERE id = $1 "
      "LIMIT 1");

    txn.conn().prepare("select_user_password",
      "SELECT password "
      "FROM public.\"User\" "
      "WHERE username = $1 "
      "LIMIT 1");

    txn.conn().prepare("insert_user",
      "INSERT INTO public.\"User\" ("
      "username, password, levels, discord_id, account_creation_date, "
      "avatar, nickname, access_token"
      ") VALUES ("
      "$1, $2, '{-1}', '-1', $3, '-1', $1, '-1'"
      ")");

    // ... annotation queries ...
    txn.conn().prepare("select_annotation_data",
      "SELECT array_to_json(array_agg(row_to_json(t))) "
      "FROM ("
      "  SELECT id::integer,"
      "         description::text,"
      "         dislikes::integer,"
      "         likes::integer,"
      "         created_at::integer,"
      "         user_id::integer"
      "  FROM public.\"Annotation\" "
      "  WHERE text_id = $1 "
      "  AND start >= $2 "
      "  AND \"end\" <= $3"
      ") t");

    txn.commit();
    return c;
  }

  /**
   * Create a new connection pool with a given size.
   * @param size Size of the connection pool.
   */
  ConnectionPool::ConnectionPool(int size) : max_size(size)
  {
    for (int i = 0; i < size; ++i)
    {
      pool.push(create_new_connection());
    }
  }

  /**
   * Destroy the connection pool and free all connections.
   */
  ConnectionPool::~ConnectionPool()
  {
    while (!pool.empty())
    {
      delete pool.front();
      pool.pop();
    }
  }

  /**
   * Validate a connection by executing a simple query.
   * @param conn Connection to validate.
   */
  int ConnectionPool::validate_connection(pqxx::connection* c)
  {
    try
    {
      return c->is_open();
    } catch (...)
    {
      return false;
    }
  }

  /**
   * Acquire a connection from the pool. This function will block until a connection is available.
   * If a connection is not used for more than 1 minute, it will be released.
   *
   * @return Connection from the pool.
   */
  pqxx::connection* ConnectionPool::acquire()
  {
    pqxx::connection* c = nullptr;
    auto now = std::chrono::steady_clock::now();

    {
      std::unique_lock<std::mutex> lock(pool_mutex);
      pool_cv.wait(lock, [this] { return !pool.empty(); });
      c = pool.front();
      pool.pop();
    }

    ConnectionMetadata & metadata = connection_metadata[c];
    const auto connection_age = std::chrono::duration_cast<std::chrono::minutes>(
      now - metadata.last_used).count();
    const auto last_health_check = std::chrono::duration_cast<std::chrono::seconds>(
      now - metadata.last_checked).count();

    if (connection_age > 1 || last_health_check > 30)
    {
      metadata.is_healthy = validate_connection(c);
      metadata.last_checked = now;
      
      if (!metadata.is_healthy)
      {
        delete c;
        c = create_new_connection();
        connection_metadata[c] = {now, now, true};
        return c;
      }
    }

    metadata.last_used = now;
    return c;
  }

  /**
   * Release a connection back to the pool.
   * @param c Connection to release.
   */
  void ConnectionPool::release(pqxx::connection* c)
  {
    if (connection_metadata[c].is_healthy)
    {
      std::lock_guard<std::mutex> lock(pool_mutex);
      pool.push(c);
      pool_cv.notify_one();
    }
    else
    {
      // ... replace unhealthy connection ...
      delete c;

      pqxx::connection* new_c = create_new_connection();
      connection_metadata[new_c] = {
        std::chrono::steady_clock::now(),
        std::chrono::steady_clock::now(),
        true
      };

      std::lock_guard<std::mutex> lock(pool_mutex);
      pool.push(new_c);
      pool_cv.notify_one();
    }
  }

  /**
   * Initialize the global connection pool.
   */
  void init_connection()
  {
    if (!global_pool)
    {
      global_pool = new ConnectionPool(5);
    }
  }

  /** 
   * Get the global connection pool.
   * @return Global connection pool.
   */
  ConnectionPool& get_connection_pool()
  {
    if (!global_pool)
    {
      throw std::runtime_error("Connection pool not initialized. Call init_connection first.");
    }
    return *global_pool;
  }
}
