// Copy the following to create `secrets.h` file.
// `secrets.h` contains sensitive information and should be excluded from Git.

// Wi-Fi
#define WIFI_SSID       "your_wifi_ssid"
#define WIFI_PASSWORD   "your_wifi_password"

// HiveMQ Cloud
#define MQTT_SERVER     "your_hivemq_server_url"
#define MQTT_PORT       8883
#define MQTT_USER       "your_hivemq_username(publish only)"
#define MQTT_PASS       "your_hivemq_password(publish only)"

// HiveMQ Cloud server certificate
// Copy the .pem file from the URL below and paste it into the ROOT_CA variable
// URL: https://community.hivemq.com/t/frequently-asked-questions-hivemq-cloud/514
const char* ROOT_CA = R"EOF(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
...
-----END CERTIFICATE-----
)EOF";