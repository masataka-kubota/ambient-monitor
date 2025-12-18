#include "wifi_manager.h"

// ---------------- Static members ----------------
Preferences WiFiManager::preferences;

// ---------------- Internal connection logic ----------------
bool WiFiManager::connectInternal(
  const String& ssid,
  const String& password,
  unsigned long timeoutMs
) {
  if (ssid.isEmpty() || password.isEmpty()) {
    Serial.println("WiFi credentials missing");
    return false;
  }

  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(100);

  WiFi.begin(ssid.c_str(), password.c_str());

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED &&
         millis() - start < timeoutMs) {
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

// ---------------- Public API ----------------
bool WiFiManager::connect() {
  WiFiConfig config;
  if (!loadConfig(config)) {
    Serial.println("WiFi not configured");
    return false;
  }
  return connectInternal(config.ssid, config.password, 8000);
}

bool WiFiManager::temporaryConnect(
  const String& ssid,
  const String& password
) {
  return connectInternal(ssid, password, 8000);
}

bool WiFiManager::reconnect() {
  Serial.println("Reconnecting WiFi...");

  if (WiFi.status() == WL_CONNECTED) {
    WiFi.disconnect(true);
    delay(300);
  }

  return connect();
}

// ---------------- Configuration ----------------
bool WiFiManager::loadConfig(WiFiConfig& config) {
  preferences.begin("wifi", true);
  config.ssid     = preferences.getString("ssid", "");
  config.password = preferences.getString("password", "");
  preferences.end();

  return !config.ssid.isEmpty();
}

void WiFiManager::saveConfig(
  const String& ssid,
  const String& password
) {
  preferences.begin("wifi", false);
  preferences.putString("ssid", ssid);
  preferences.putString("password", password);
  preferences.end();

  Serial.println("WiFi config saved to NVS");
}

void WiFiManager::clearConfig() {
  preferences.begin("wifi", false);
  preferences.clear();
  preferences.end();

  Serial.println("WiFi config cleared");
}
