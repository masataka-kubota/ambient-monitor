#include "ble_manager.h"
#include "wifi_manager.h"

const char* BLE_DEVICE_NAME = "ESP32-Monitor";

// Characteristic pointers
static BLECharacteristic* wifiConfigChar = nullptr;
static BLECharacteristic* wifiStatusChar = nullptr;

/**
 * BLE server callbacks
 * - Allow only one client connection
 * - Stop advertising while connected
 */
class SingleConnectionServerCallbacks : public BLEServerCallbacks {
public:
    void onConnect(BLEServer* pServer) override {
        Serial.println("🔗 BLE client connected");
        BLEDevice::getAdvertising()->stop();
        Serial.println("🛑 Advertising stopped (single connection mode)");
    }

    void onDisconnect(BLEServer* pServer) override {
        Serial.println("❌ BLE client disconnected");
        BLEDevice::getAdvertising()->start();
        Serial.println("📢 Advertising restarted");
    }
};

/**
 * Set WiFi status (JSON unified)
 * - Used for both initial READ value and NOTIFY updates
 */
void setWiFiStatus(const char* status, const char* ssid, bool notify) {
  if (!wifiStatusChar) return;

  DynamicJsonDocument doc(128);
  doc["status"] = status;
  if (ssid) doc["ssid"] = ssid;

  String payload;
  serializeJson(doc, payload);

  wifiStatusChar->setValue(payload.c_str());
  if (notify) wifiStatusChar->notify();

  Serial.printf("📡 WiFi status %s: %s\n", notify ? "notified" : "set", payload.c_str());
}

/**
 * WiFi config write callback
 * Called immediately when UI writes WiFi JSON
 */
class WiFiConfigCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* characteristic) override {
    String value = characteristic->getValue();
    if (value.isEmpty()) return;

    DynamicJsonDocument doc(256);
    if (deserializeJson(doc, value)) return;

    String ssid = doc["ssid"] | "";
    String password = doc["password"] | "";

    if (ssid.isEmpty()) {
      // Initialize to factory settings
      clearWiFiConfig();
      setWiFiStatus("not_configured", nullptr, true);
      Serial.println("📡 Wi-Fi initialized to factory settings");
      return;
    }

    setWiFiStatus("connecting", ssid.c_str(), true);

    bool ok = temporaryConnectToWiFi(ssid, password);

    if (ok) {
        saveWiFiConfig(ssid, password);
        setWiFiStatus("connected", ssid.c_str(), true);
    } else {
        setWiFiStatus("failed", nullptr, true);
    }
  }
};

void initBLE() {
  BLEDevice::init(BLE_DEVICE_NAME);

  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new SingleConnectionServerCallbacks());

  BLEService* service = server->createService(BLE_SERVICE_UUID);

  wifiConfigChar = service->createCharacteristic(
    WIFI_CONFIG_CHAR_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  wifiConfigChar->setCallbacks(new WiFiConfigCallbacks());

  wifiStatusChar = service->createCharacteristic(
    WIFI_STATUS_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  wifiStatusChar->addDescriptor(new BLE2902());

  // ---- initial status ----
  WiFiConfig config;
  if (!loadWiFiConfig(config)) {
    setWiFiStatus("not_configured", nullptr, false);
  } else if (WiFi.status() == WL_CONNECTED) {
    setWiFiStatus("connected", config.ssid.c_str(), false);
  } else {
    setWiFiStatus("configured", config.ssid.c_str(), false);
  }

  service->start();
  BLEDevice::getAdvertising()->addServiceUUID(BLE_SERVICE_UUID);
  BLEDevice::getAdvertising()->start();
}
