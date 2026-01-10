#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>

// ====== PIN ======
#define DHTPIN     D2
#define DHTTYPE    DHT22

#define LIGHT_PIN  D5
#define SOUND_PIN  D6
#define MQ2_PIN    D3      // nếu boot lỗi -> đổi sang D1/D7
#define MQ135_PIN  A0
// =================

DHT dht(DHTPIN, DHTTYPE);
ESP8266WebServer server(80);

// ===== WiFi AP =====
const char* ssid = "IoT-Demo";
const char* pass = "12345678";

// tick in log mỗi 1s
unsigned long lastTick = 0;
const unsigned long TICK_MS = 1000;

// DHT đọc 2s để ổn định
unsigned long lastDhtTry = 0;
const unsigned long DHT_MS = 2000;

float lastT = NAN, lastH = NAN;
unsigned long lastDhtOk = 0;

int lightActive = 0, soundActive = 0, mq2Active = 0;
int mq135Value = 0;

void readDhtSafe() {
  float t = dht.readTemperature(); // °C
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    delay(50);
    t = dht.readTemperature();
    h = dht.readHumidity();
  }

  if (!isnan(t) && !isnan(h)) {
    lastT = t;
    lastH = h;
    lastDhtOk = millis();
  }
}

String buildJson() {
  String json = "{";

  // nếu DHT fail quá 5s -> null
  if (isnan(lastT) || isnan(lastH) || (millis() - lastDhtOk > 5000)) {
    json += "\"temp\":null,\"hum\":null,";
  } else {
    json += "\"temp\":" + String(lastT, 1) + ",";
    json += "\"hum\":"  + String(lastH, 1) + ",";
  }

  json += "\"mq135\":" + String(mq135Value) + ",";
  json += "\"light\":" + String(lightActive) + ",";
  json += "\"sound\":" + String(soundActive) + ",";
  json += "\"mq2\":"   + String(mq2Active);
  json += "}";

  return json;
}

void setup() {
  Serial.begin(115200);
  delay(200);

  dht.begin();

  pinMode(LIGHT_PIN, INPUT_PULLUP);
  pinMode(SOUND_PIN, INPUT_PULLUP);
  pinMode(MQ2_PIN,   INPUT_PULLUP);

  // WiFi AP
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, pass);

  Serial.println("BOOT_OK");
  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP()); // thường là 192.168.4.1

  // API: /data
  server.on("/data", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Cache-Control", "no-cache");
    server.send(200, "application/json", buildJson());
  });

  server.begin();
}

void loop() {
  server.handleClient();

  // DHT theo chu kỳ 2s
  if (millis() - lastDhtTry >= DHT_MS) {
    lastDhtTry = millis();
    readDhtSafe();
  }

  // cập nhật sensor + log mỗi 1s
  if (millis() - lastTick < TICK_MS) return;
  lastTick = millis();

  // DO active-LOW: vượt ngưỡng -> LOW => 1
  lightActive = (digitalRead(LIGHT_PIN) == LOW) ? 1 : 0;
  soundActive = (digitalRead(SOUND_PIN) == LOW) ? 1 : 0;
  mq2Active   = (digitalRead(MQ2_PIN)   == LOW) ? 1 : 0;

  // MQ135 analog
  mq135Value  = analogRead(MQ135_PIN);

  // Serial JSON 1 dòng/giây (debug)
  Serial.println(buildJson());
}
