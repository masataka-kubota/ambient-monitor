#pragma once
#include <WiFi.h>
#include <Preferences.h>
#include <Arduino.h>

struct WiFiConfig {
  String ssid;
  String password;
};

// WiFi initialization
void initWiFiManager();

// NVS Operation
bool loadWiFiConfig(WiFiConfig &config);
void saveWiFiConfig(const String &ssid, const String &password);
void clearWiFiConfig();

// WiFi Operation
bool connectToWiFi();
bool isWiFiConfigured();
bool reconnectWiFi();