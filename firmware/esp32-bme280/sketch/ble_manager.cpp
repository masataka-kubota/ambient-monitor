#include "ble_manager.h"
#include "wifi_manager.h"
#include "secrets.h"

// Forward declaration (defined in sketch.ino)
extern void resetBleTick();

// ---------------- BLE UUIDs ----------------
#define BLE_SERVICE_UUID        "43373C9D-F63D-4C72-A978-ABD8523DABFB"
#define WIFI_CONFIG_CHAR_UUID   "5FD5AD97-4A4E-4E7E-BB31-7D69E179D965"
#define WIFI_STATUS_CHAR_UUID   "76B20411-217E-49E4-87DE-D544FB19A443"
#define MEASUREMENT_CHAR_UUID   "1DE752AB-EA22-4757-85B2-AC35C7FBB5E1"

static const char* BLE_DEVICE_NAME = "ESP32-Monitor";

// ---------------- Static members ----------------
volatile bool BLEManager::clientConnected = false;

BLECharacteristic* BLEManager::wifiConfigChar   = nullptr;
BLECharacteristic* BLEManager::wifiStatusChar   = nullptr;
BLECharacteristic* BLEManager::measurementChar  = nullptr;

// ---------------- Server Callbacks ----------------
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer*) override {
    BLEManager::onClientConnected();
  }

  void onDisconnect(BLEServer*) override {
    BLEManager::onClientDisconnected();
  }
};

// ---------------- WiFi Config Write Callback ----------------
class WiFiConfigCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* characteristic) override {
    String value = characteristic->getValue();
    if (value.isEmpty()) return;

    DynamicJsonDocument doc(256);
    if (deserializeJson(doc, value)) return;

    String ssid = doc["ssid"] | "";
    String password = doc["password"] | "";

    if (ssid.isEmpty()) {
      WiFiManager::clearConfig();
      BLEManager::setWiFiStatus("not_configured", nullptr, true);
      return;
    }

    BLEManager::setWiFiStatus("connecting", ssid.c_str(), true);

    if (WiFiManager::temporaryConnect(ssid, password)) {
      WiFiManager::saveConfig(ssid, password);
      BLEManager::setWiFiStatus("connected", ssid.c_str(), true);
    } else {
      BLEManager::setWiFiStatus("failed", nullptr, true);
    }
  }
};

// ---------------- Public API ----------------
void BLEManager::init() {
  BLEDevice::init(BLE_DEVICE_NAME);
  BLEDevice::setMTU(128);

  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());

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

  measurementChar = service->createCharacteristic(
    MEASUREMENT_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  measurementChar->addDescriptor(new BLE2902());

  WiFiConfig config;
  if (!WiFiManager::loadConfig(config)) {
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

bool BLEManager::isClientConnected() {
  return clientConnected;
}

void BLEManager::setWiFiStatus(const char* status, const char* ssid, bool notify) {
  if (!wifiStatusChar) return;

  DynamicJsonDocument doc(128);
  doc["status"] = status;
  if (ssid) doc["ssid"] = ssid;

  String payload;
  serializeJson(doc, payload);

  wifiStatusChar->setValue(payload.c_str());
  if (notify) wifiStatusChar->notify();
}

void BLEManager::updateMeasurement(float t, float h, float p, bool notify) {
  if (!measurementChar || !clientConnected) return;

  DynamicJsonDocument doc(128);
  doc["temperature"] = round(t * 100) / 100;
  doc["humidity"]    = round(h * 100) / 100;
  doc["pressure"]    = round(p * 100) / 100;
  doc["timestamp"]   = time(nullptr);

  String payload;
  serializeJson(doc, payload);

  measurementChar->setValue(payload.c_str());
  if (notify) measurementChar->notify();
}

// ---------------- Internal ----------------
void BLEManager::onClientConnected() {
  clientConnected = true;
  BLEDevice::getAdvertising()->stop();
}

void BLEManager::onClientDisconnected() {
  clientConnected = false;
  resetBleTick();
  BLEDevice::getAdvertising()->start();
}