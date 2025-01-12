#include "email.hpp"

namespace email
{
  /**
   * Helper function to get the current date in RFC 822 format.
   * Used to set the Date header in the email.
   *
   * @return Current date in RFC 822 format.
   */
  std::string get_rfc822_date()
  {
    char buffer[100];
    std::time_t now = std::time(nullptr);
    std::strftime(buffer, sizeof(buffer), "%a, %d %b %Y %H:%M:%S %z", std::localtime(&now));
    return buffer;
  }

  /**
   * Callback function used by CURL to read the email payload.
   *
   * @param ptr Pointer to the buffer where the data should be copied.
   * @param size Size of each element to be copied.
   * @param nmemb Number of elements to be copied.
   * @param userp Pointer to the user data.
   * @return Number of bytes copied.
   */
  static size_t payload_source(char * ptr, size_t size, size_t nmemb, void * userp)
  {
    static size_t offset = 0;
    std::string * payload = static_cast<std::string*>(userp);
    
    size_t available = payload->length() - offset;
    size_t requested = size * nmemb;
    size_t to_copy = std::min(available, requested);
    
    if (to_copy > 0)
    {
      std::memcpy(ptr, payload->c_str() + offset, to_copy);
      offset += to_copy;
      return to_copy;
    }
    
    offset = 0;
    return 0;
  }

  SMTPClient::SMTPClient(const std::string & host, int port, bool use_tls)
  : host_(host)
  , port_(port)
  , use_tls_(use_tls)
  , is_connected_(false)
  {
    curl_ = curl_easy_init();
    if (!curl_)
    {
      throw std::runtime_error("Failed to initialize CURL");
    }
  }

  SMTPClient::~SMTPClient()
  {
    if (is_connected_)
    {
      disconnect();
    }
    curl_easy_cleanup(curl_);
  }

  /**
   * Connect to the SMTP server.
   * This method is called before sending an email.
   */
  void SMTPClient::connect()
  {
    std::string url = (use_tls_ ? "smtps://" : "smtp://") + host_ + ":" + std::to_string(port_);
    curl_easy_reset(curl_);

    // ... set options ...
    curl_easy_setopt(curl_, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl_, CURLOPT_USE_SSL, CURLUSESSL_ALL);
    curl_easy_setopt(curl_, CURLOPT_SSL_VERIFYPEER, 1L);
    curl_easy_setopt(curl_, CURLOPT_SSL_VERIFYHOST, 2L);
    curl_easy_setopt(curl_, CURLOPT_PROTOCOLS, CURLPROTO_SMTPS);
    curl_easy_setopt(curl_, CURLOPT_DEFAULT_PROTOCOL, "smtps");
    curl_easy_setopt(curl_, CURLOPT_CONNECTTIMEOUT, 30L);
    curl_easy_setopt(curl_, CURLOPT_TIMEOUT, 60L);
    
    is_connected_ = true;
  }

  /**
   * Login to the SMTP server.
   *
   * @param username Username for authentication.
   * @param password Password for authentication.
   */
  void SMTPClient::login(const std::string & username, const std::string & password)
  {
    if (!is_connected_)
    {
      throw std::runtime_error("Not connected to SMTP server");
    }
    
    // ... auth login ...
    curl_easy_setopt(curl_, CURLOPT_USERNAME, username.c_str());
    curl_easy_setopt(curl_, CURLOPT_PASSWORD, password.c_str());
    
    // ... test authentication ...
    CURLcode res = curl_easy_perform(curl_);
    
    if (res != CURLE_OK)
    {
      std::string error_msg = "Authentication failed (";
      error_msg += std::to_string(res);
      error_msg += "): ";
      error_msg += curl_easy_strerror(res);
      throw std::runtime_error(error_msg);
    }
  }

  /**
   * Send an email. This works by building the email content and then using
   * CURL to send the email to the SMTP server.
   *
   * @param from Email address of the sender.
   * @param to Email address of the recipient.
   * @param subject Subject of the email.
   * @param body Body of the email.
   */
  void SMTPClient::send_mail(const std::string & from, 
    const std::string & to,
    const std::string & subject,
    const std::string & body)
  {
    if (!is_connected_)
    {
      throw std::runtime_error("Not connected to SMTP server");
    }

    struct curl_slist * recipients = NULL;
    recipients = curl_slist_append(recipients, to.c_str());

    // ... build the email ...
    std::stringstream email_content;
    email_content << "Date: " << get_rfc822_date() << "\r\n";
    email_content << "To: " << to << "\r\n";
    email_content << "From: " << from << "\r\n";
    email_content << "Subject: " << subject << "\r\n";
    email_content << "Content-Type: text/plain; charset=UTF-8\r\n";
    email_content << "\r\n";
    email_content << body;

    std::string payload = email_content.str();

    // ... set options for sending email ...
    curl_easy_setopt(curl_, CURLOPT_MAIL_FROM, from.c_str());
    curl_easy_setopt(curl_, CURLOPT_MAIL_RCPT, recipients);
    curl_easy_setopt(curl_, CURLOPT_READFUNCTION, payload_source);
    curl_easy_setopt(curl_, CURLOPT_READDATA, & payload);
    curl_easy_setopt(curl_, CURLOPT_UPLOAD, 1L);
    curl_easy_setopt(curl_, CURLOPT_TIMEOUT, 60L);

    CURLcode res = curl_easy_perform(curl_);
    curl_slist_free_all(recipients);

    if (res != CURLE_OK)
    {
      std::string error_msg = "Failed to send email: ";
      error_msg += curl_easy_strerror(res);
      throw std::runtime_error(error_msg);
    }
  }

  /**
   * Disconnect from the SMTP server.
   */
  void SMTPClient::disconnect()
  {
    if (is_connected_)
    {
      curl_easy_reset(curl_);
      is_connected_ = false;
    }
  }

  /**
   * Get the singleton instance of the EmailService.
   *
   * @return Reference to the EmailService instance.
   */
  EmailService & EmailService::get_instance()
  {
    static EmailService instance;
    return instance;
  }

  /**
   * Configure the EmailService with the given configuration.
   *
   * @param config Configuration for the email service.
   */
  void EmailService::configure(const email_config & config)
  {
    std::lock_guard<std::mutex> lock(mutex_);
    client_ = std::make_unique<SMTPClient>(config.host, config.port);
    client_->connect();
    client_->login(config.username, config.password);
    is_configured_ = true;

    std::cout << "Email service configured" << std::endl;
  }

  /**
   * Send an email using the configured SMTP server.
   *
   * @param from Email address of the sender.
   * @param to Email address of the recipient.
   * @param subject Subject of the email.
   * @param body Body of the email.
   */
  void EmailService::send_email(const std::string & from, 
    const std::string & to,
    const std::string & subject,
    const std::string & body)
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (!is_configured_)
    {
      throw std::runtime_error("Email service not configured");
    }
    client_->send_mail(from, to, subject, body);
  }

  EmailService::~EmailService()
  {
    if (client_)
    {
      client_->disconnect();
    }
  }
}