#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>
#include "secrets.h"

WiFiClientSecure wifiClient;
PubSubClient client(wifiClient);
Adafruit_BME280 bme;

unsigned long lastPublishToHiveMQ = 0;
const unsigned long PUBLISH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
// unsigned long lastSendBLE = 0;

// 📶 Wi-Fi connection
void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

// 📶 MQTT connection
void connectToMQTT() {
  client.setServer(MQTT_SERVER, MQTT_PORT);
  wifiClient.setCACert(ROOT_CA);

  while (!client.connected()) {
    Serial.println("Connecting to HiveMQ securely...");
    if (client.connect("esp32-client-001", MQTT_USER, MQTT_PASS)) {
      Serial.println("Connected to HiveMQ!");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

// 📡 BME280 data Transmission
void publishSensorData() {
  // get sensor data
  float temperature = bme.readTemperature();
  float humidity = bme.readHumidity();
  float pressure = bme.readPressure() / 100.0;

  // Transform BME280 data to JSON
  DynamicJsonDocument doc(128);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["pressure"] = pressure;

  char jsonBuffer[128];
  serializeJson(doc, jsonBuffer);

  // publish
  client.publish("sensors/device/data", jsonBuffer);

  // debug
  Serial.println("Published JSON:");
  Serial.println(jsonBuffer);
}

void setup() {
  Serial.begin(115200);
  while (!Serial); // wait for serial port to connect

  // initialize BME280 sensor
  if (!bme.begin(0x76)) {
    Serial.println("BME280 not found! Check wiring or I2C address.");
    while (1);
  }

  Serial.println("BME280 sensor initialized successfully!");

  connectToWiFi();
  connectToMQTT();
}

void loop() {
  unsigned long now = millis();

  if (!client.connected()) {
    connectToMQTT(); // reconnect
  }
  client.loop();

  if (now - lastPublishToHiveMQ >= PUBLISH_INTERVAL_MS) {
    publishSensorData();
    lastPublishToHiveMQ = now;
  }
}
