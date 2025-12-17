#include "ble_manager.h"
#include "wifi_manager.h"

// BLE constants
#define BLE_SERVICE_UUID "43373C9D-F63D-4C72-A978-ABD8523DABFB"
#define WIFI_CONFIG_CHAR_UUID "5FD5AD97-4A4E-4E7E-BB31-7D69E179D965"
#define WIFI_STATUS_CHAR_UUID "76B20411-217E-49E4-87DE-D544FB19A443"
#define MEASUREMENT_CHAR_UUID "1DE752AB-EA22-4757-85B2-AC35C7FBB5E1"

const char* BLE_DEVICE_NAME = "ESP32-Monitor";

volatile bool bleClientConnected = false;

// Characteristic pointers
static BLECharacteristic* wifiConfigChar = nullptr;
static BLECharacteristic* wifiStatusChar = nullptr;
static BLECharacteristic* measurementChar = nullptr;

/**
 * BLE server callbacks
 * - Allow only one client connection
 * - Stop advertising while connected
 */
class SingleConnectionServerCallbacks : public BLEServerCallbacks {
public:
    void onConnect(BLEServer* pServer) override {
      bleClientConnected = true;
      BLEDevice::getAdvertising()->stop();
      Serial.println("🔗 BLE client connected and advertising stopped.");
    }

    void onDisconnect(BLEServer* pServer) override {
      bleClientConnected = false;
      BLEDevice::getAdvertising()->start();
      Serial.println("❌ BLE client disconnected and advertising restarted.");
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

  // ---- create service ----
  BLEService* service = server->createService(BLE_SERVICE_UUID);

  // ---- create characteristic ----
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

  measurementChar = service->createCharacteristic(
    MEASUREMENT_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  measurementChar->addDescriptor(new BLE2902());

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

// ---------------- Notify Measurement ----------------
void notifyMeasurement(float t, float h, float p) {
  if (!measurementChar || !bleClientConnected) return;

  DynamicJsonDocument doc(256);
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["pressure"] = p;
  doc["timestamp"] = time(nullptr);

  String payload;
  serializeJson(doc, payload);

  measurementChar->setValue(payload.c_str());
  measurementChar->notify();
}
