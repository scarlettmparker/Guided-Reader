# [Guided Reader](https://reader.scarlettparker.co.uk)

## Overview

**Guided Reader** is a highly performant and responsive annotation tool that allows users to explore and annotate texts from τράπεζα κειμένων ([Greek Text Bank](https://www.greek-language.gr/certification/dbs/teachers/index.html)) in a style similar to Genius.com.

The application is built with:
- **SolidJS** for the front-end.
- **C++** for the back-end.

## Features

- **Text annotation**: Annotate texts interactively, with a word reference button that uses the [wordreference](https://www.npmjs.com/package/wordreference) npm package to display Greek-to-English dictionary entries for words.
- **Authentication via Discord OAuth2**.
- **Integration with PostgreSQL and Redis** for data and session management.

---

## Getting Started

### Back-End Setup

#### Prerequisites
- CMake (>= 3.10)
- PostgreSQL
- Redis
- C++ compiler with C++17 support
- Dependencies:
  - Curl
  - Boost
  - OpenSSL
  - Libpq
  - Libpqxx
  - Bcrypt ([hilch/Bcrypt.cpp](https://github.com/hilch/Bcrypt.cpp)). You will need to build it and place the .a file into /server/lib 
  - hiredis
  - redis-plus-plus

#### Environment Variables
Create a `.env` file in `server/env/.env` with the following:

```env
READER_SERVER_HOST=Back-end server host
READER_SERVER_PORT=Back-end server port
READER_SERVER_DEV=Set to true to enable SSL on the server
READER_SECRET_KEY=Secret key for session ID signing
READER_EXPECTED_DOMAIN=Expected domain for client requests (optional SAN header validation)
READER_LOCAL_HOST=Set to true to allow self-signed certificates in SSL web server mode
READER_FULL_CHAIN=Location of full chain certificate file
READER_PRIVATE_KEY=Location of private key file
READER_DH_PARAM=Location of Diffie-Hellman parameters file
READER_CHAIN=Location of chain file
READER_DB_USERNAME=PostgreSQL username
READER_DB_PASSWORD=PostgreSQL password
READER_DB_HOST=PostgreSQL host address
READER_DB_PORT=PostgreSQL port
READER_DB_NAME=PostgreSQL database name
READER_REDIS_HOST=Redis server host
READER_REDIS_PORT=Redis server port
READER_SESSION_EXPIRE_LENGTH=Expiration time for session IDs in Redis
READER_DISCORD_REDIRECT_URI=Discord OAuth2 redirect URI for login/registration
READER_DISCORD_REDIRECT_LINK_URI=Discord OAuth2 redirect URI for linking accounts
READER_DISCORD_CLIENT_SECRET=Discord OAuth2 client secret
READER_DISCORD_CLIENT_ID=Discord OAuth2 client ID
READER_GREEK_LEARNING_GUILD=Greek Learning Server Guild ID
READER_DISCORD_USER_URL=Discord API endpoint for user info
READER_DISCORD_USER_GUILDS_URL=Discord API endpoint for user guilds
READER_DISCORD_TOKEN_URL=Discord API endpoint for token management
READER_EMAIL_HOST=SMTP host for email verification (e.g., smtp.gmail.com)
READER_EMAIL_PORT=SMTP port for email (e.g., 465)
READER_EMAIL_ADDRESS=Email address for SMTP
READER_EMAIL_PASSWORD=Password for SMTP
```

#### Building the Back-End
1. Navigate to the back-end directory:
   ```bash
   cd server
   ```
2. Create a build directory and navigate into it:
   ```bash
   mkdir build && cd build
   ```
3. Run CMake:
   ```bash
   cmake ..
   ```
4. Build the server:
   ```bash
   make -j$(nproc)
   ```
5. Run the server (requires root privileges as server runs on port 443):
   ```bash
   sudo ./ReaderServer
   ```

#### Notes
- The back-end uses PostgreSQL for its primary database and Redis for session management.
- PostgreSQL connection pool dynamically allocates connections based on the number of CPU threads:
  ```cpp
  global_pool = new ConnectionPool(std::max(10u, 2 * std::thread::hardware_concurrency()));
  ```
- Redis has a fixed pool size of 10 connections.
- API endpoints can be added by creating a new file in `server/api/` and following the existing naming conventions. These files are automatically detected and linked during compilation.

#### Database Schema
The database schema dump is located at:
```
server/database_schema.sql
```

---

### Front-End Setup

#### Prerequisites
- Node.js

#### Environment Variables
Create a `.env` file in the front-end directory with the following:

```env
VITE_CLIENT_HOST=Front-end host address
VITE_CLIENT_PORT=Front-end port
VITE_ALLOWED_HOSTS=List of hosts permitted to connect to the front-end
VITE_CLIENT_CERT=Location of client certificate file
VITE_CLIENT_KEY=Location of client private key file
VITE_CLIENT_CA=Location of client certificate authority file
VITE_SERVER_HOST=Back-end server host
VITE_SERVER_PORT=Back-end server port
VITE_SERVER_DEV=Set to true to enable HTTPS agents for the proxy to the back-end server
VITE_DISCORD_REDIRECT_URI=Discord OAuth2 callback URL for login/registration
VITE_DISCORD_LINK_REDIRECT_URI=Discord OAuth2 callback URL for linking accounts
```

#### Running the Front-End
1. Navigate to the front-end directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. To build for production:
   ```bash
   npm run build
   ```
5. Serve the production build:
   ```bash
   npm run serve
   ```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Additional Information
- Discord Guild ID for the Greek Learning Server: **350234668680871946**
- Discord API Endpoints:
  - **User Info:** `/api/users/@me`
  - **User Guilds:** `/api/users/@me/guilds`
  - **Token:** `/api/oauth2/token`
- Discord OAuth2 Permissions:
  - identify, guilds, guilds.members.read
- Discord Redirect URI: **client/auth_discord**
- Discord Link Redirect URI: **client/auth_discord?verify=true**

For more details, visit the website at [reader.scarlettparker.co.uk](https://reader.scarlettparker.co.uk).

