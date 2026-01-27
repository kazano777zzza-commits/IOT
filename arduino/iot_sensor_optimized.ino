#include <DHT.h>

// ===== Arduino UNO - Tổng hợp cảm biến (Analog) + DHT22 (D2) =====
// Sound AO -> A0
// Light AO -> A1
// MQ2   AO -> A3
// MQ135 AO -> A4
// DHT22 (Temp/Hum) -> D2

#define SOUND_AO   A0
#define LIGHT_AO   A1
#define MQ2_AO     A3
#define MQ135_AO   A4

// ===== DHT =====
#define DHT_PIN  2
#define DHT_TYPE DHT22     // ✅ đổi sang DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// ===== Ngưỡng (0-1023) - tự chỉnh theo môi trường thực tế =====
#define SOUND_THRESHOLD   400
#define LIGHT_THRESHOLD   500
#define MQ2_THRESHOLD     400
#define MQ135_THRESHOLD   450

void setup() {
  Serial.begin(9600);

  dht.begin();
  delay(3000); // ✅ đợi DHT22 ổn định

  // MQ2/MQ135 cần thời gian làm nóng
  Serial.println("Dang lam nong MQ2 & MQ135...");
  delay(20000);
  Serial.println("MQ2 & MQ135 san sang");
}

void loop() {
  // ===== Đọc analog =====
  int soundValue = analogRead(SOUND_AO);
  int lightValue = analogRead(LIGHT_AO);
  int mq2Value   = analogRead(MQ2_AO);
  int mq135Value = analogRead(MQ135_AO);

  // ===== Quyết định theo ngưỡng =====
  int soundDetected = (soundValue > SOUND_THRESHOLD) ? 1 : 0;
  int isBright      = (lightValue > LIGHT_THRESHOLD) ? 1 : 0;
  int gasDetected   = (mq2Value   > MQ2_THRESHOLD)   ? 1 : 0;
  int badAir        = (mq135Value > MQ135_THRESHOLD) ? 1 : 0;

  // ===== Đọc DHT22 =====
  float hum  = dht.readHumidity();
  float temp = dht.readTemperature(false); // ✅ Celsius

  // Nếu đọc lỗi (NaN) thì set -1 cho dễ xử lý bên ESP
  int dhtOk = 1;
  if (isnan(hum) || isnan(temp)) {
    dhtOk = 0;
    hum = -1;
    temp = -1;
  }

  // ===== Gửi JSON tổng hợp 1 lần =====
  Serial.print("{");

  // Sound
  Serial.print("\"sound\":"); Serial.print(soundDetected);
  Serial.print(",\"sound_value\":"); Serial.print(soundValue);
  Serial.print(",\"sound_msg\":\""); Serial.print(soundDetected ? "Co tieng dong" : "Yen lang"); Serial.print("\"");

  // Light
  Serial.print(",\"light\":"); Serial.print(isBright);
  Serial.print(",\"light_value\":"); Serial.print(lightValue);
  Serial.print(",\"light_msg\":\""); Serial.print(isBright ? "Sang" : "Toi"); Serial.print("\"");

  // MQ2
  Serial.print(",\"mq2\":"); Serial.print(gasDetected);
  Serial.print(",\"mq2_value\":"); Serial.print(mq2Value);
  Serial.print(",\"mq2_msg\":\""); Serial.print(gasDetected ? "Phat hien khi/gas" : "Binh thuong"); Serial.print("\"");

  // MQ135
  Serial.print(",\"mq135\":"); Serial.print(badAir);
  Serial.print(",\"mq135_value\":"); Serial.print(mq135Value);
  Serial.print(",\"mq135_msg\":\""); Serial.print(badAir ? "Chat luong khong khi kem" : "Khong khi binh thuong"); Serial.print("\"");

  // DHT Temp/Hum
  Serial.print(",\"dht_ok\":"); Serial.print(dhtOk);
  Serial.print(",\"temp\":"); Serial.print(temp, 1);
  Serial.print(",\"hum\":"); Serial.print(hum, 1);
  Serial.print(",\"dht_msg\":\"");
  Serial.print(dhtOk ? "DHT OK" : "DHT loi doc");
  Serial.print("\"");

  Serial.println("}");

  delay(2000); // ✅ DHT22 bắt buộc đọc chậm (>= 2s)
}