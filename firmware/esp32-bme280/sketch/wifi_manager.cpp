#include "wifi_manager.h"

static Preferences preferences;

// ---------------- connectToWiFiInternal ----------------
static bool connectToWiFiInternal(const String& ssid, const String& password, unsigned long timeoutMs) {
  if (ssid.isEmpty() || password.isEmpty()) return false;

  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(100);

  WiFi.begin(ssid.c_str(), password.c_str());

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < timeoutMs) {
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
  return connectToWiFiInternal(config.ssid, config.password, 8000);
}

// ---------------- Temporary Connection ----------------
bool temporaryConnectToWiFi(const String& ssid, const String& password) {
  return connectToWiFiInternal(ssid, password, 8000);
}

// ---------------- Reconnection ----------------
bool reconnectWiFi() {
  Serial.println("Reconnecting WiFi...");

  // Disconnect WiFi, if existing connection.
  if (WiFi.status() == WL_CONNECTED) {
    WiFi.disconnect(true);
    delay(300);
  }

  return connectToWiFi();
}
