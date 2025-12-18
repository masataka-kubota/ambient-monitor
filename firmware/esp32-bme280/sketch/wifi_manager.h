#pragma once
#include <WiFi.h>
#include <Preferences.h>
#include <Arduino.h>

struct WiFiConfig {
  String ssid;
  String password;
};

class WiFiManager {
public:
  // ---- Connection ----
  static bool connect();           // Connect using stored config
  static bool reconnect();         // Force reconnect
  static bool temporaryConnect(
    const String& ssid,
    const String& password
  );                               // One-shot connect

  // ---- Configuration ----
  static bool loadConfig(WiFiConfig& config);
  static void saveConfig(
    const String& ssid,
    const String& password
  );
  static void clearConfig();

private:
  // ---- Internal helpers ----
  static bool connectInternal(
    const String& ssid,
    const String& password,
    unsigned long timeoutMs
  );

  static Preferences preferences;
};