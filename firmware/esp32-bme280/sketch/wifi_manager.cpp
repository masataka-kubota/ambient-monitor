#include "wifi_manager.h"

static Preferences preferences;

// ---------------- Initializer ----------------
void initWiFiManager() {
  // Currently do nothing, but may be used in the future.
}

// ---------------- NVS ----------------
bool loadWiFiConfig(WiFiConfig &config) {
  preferences.begin("wifi", true); // read-only
  config.ssid = preferences.getString("ssid", "");
  config.password = preferences.getString("password", "");
  preferences.end();

  return !config.ssid.isEmpty();
}

void saveWiFiConfig(const String &ssid, const String &password) {
  preferences.begin("wifi", false);
  preferences.putString("ssid", ssid);
  preferences.putString("password", password);
  preferences.end();

  Serial.println("WiFi config saved to NVS");
}

void clearWiFiConfig() {
  preferences.begin("wifi", false);
  preferences.clear();
  preferences.end();

  Serial.println("WiFi config cleared");
}

bool isWiFiConfigured() {
  WiFiConfig config;
  return loadWiFiConfig(config);
}

// ---------------- Wi-Fi Core ----------------
bool connectToWiFi() {
  WiFiConfig config;
  if (!loadWiFiConfig(config)) {
    Serial.println("WiFi not configured");
    return false;
  }

  Serial.print("Connecting to WiFi: ");
  Serial.println(config.ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(config.ssid.c_str(), config.password.c_str());

  unsigned long start = millis();
  const unsigned long timeout = 15000;

  while (WiFi.status() != WL_CONNECTED && millis() - start < timeout) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    return true;
  }

  Serial.println("\nWiFi connection failed");
  return false;
}

bool reconnectWiFi() {
  Serial.println("Reconnecting WiFi...");

  // Disconnect WiFi, if existing connection.
  if (WiFi.status() == WL_CONNECTED) {
    WiFi.disconnect(true);
    delay(300);
  }

  return connectToWiFi();
}
