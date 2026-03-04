#include <DHT.h>
#include <Servo.h>

// ===== Arduino UNO - Tổng hợp cảm biến (Analog) + DHT22 (D2) =====
// Sound AO -> A0
// Light AO -> A1
// MQ2   AO -> A3
// MQ135 AO -> A4
// DHT22 -> D2
// Servo -> A5

#define SOUND_AO   A0
#define LIGHT_AO   A1
#define MQ2_AO     A3
#define MQ135_AO   A4

// ===== DHT =====
#define DHT_PIN  2
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// ===== SERVO =====
#define SERVO_PIN A5
Servo doorServo;
int doorOpenAngle = 120;
int doorCloseAngle = 25;
bool doorOpened = false;
int previousTriggerState = 0;
bool servoAttached = false;   // thêm để quản lý attach/detach

// ===== Ngưỡng =====
#define SOUND_THRESHOLD   400
#define LIGHT_THRESHOLD   500
#define MQ2_THRESHOLD     400
#define MQ135_THRESHOLD   450

void setup() {
  Serial.begin(9600);

  dht.begin();
  delay(3000);

  Serial.println("Dang lam nong MQ2 & MQ135...");
  delay(2000);
  Serial.println("MQ2 & MQ135 san sang");
}

void loop() {

  int soundValue = analogRead(SOUND_AO);
  int lightValue = analogRead(LIGHT_AO);
  int mq2Value   = analogRead(MQ2_AO);
  int mq135Value = analogRead(MQ135_AO);

  int soundDetected = (soundValue > SOUND_THRESHOLD) ? 1 : 0;
  int isBright      = (lightValue > LIGHT_THRESHOLD) ? 1 : 0;
  int gasDetected   = (mq2Value   > MQ2_THRESHOLD)   ? 1 : 0;
  int badAir        = (mq135Value > MQ135_THRESHOLD) ? 1 : 0;

  // ===== Servo control (an toàn) =====
  int currentTriggerState = (gasDetected == 1 || badAir == 1) ? 1 : 0;

  if (currentTriggerState != previousTriggerState) {

    if (!servoAttached) {
      doorServo.attach(SERVO_PIN);
      servoAttached = true;
    }

    if (currentTriggerState == 1) {
      doorServo.write(doorOpenAngle);    // Có gas → mở
    } else {
      doorServo.write(doorCloseAngle);   // Hết gas → đóng
    }

    delay(700);            // chờ servo quay xong
    doorServo.detach();    // ngừng phát xung
    servoAttached = false;

    previousTriggerState = currentTriggerState;
  }

  float hum  = dht.readHumidity();
  float temp = dht.readTemperature(false);

  int dhtOk = 1;
  if (isnan(hum) || isnan(temp)) {
    dhtOk = 0;
    hum = -1;
    temp = -1;
  }

  Serial.print("{");

  Serial.print("\"sound\":"); Serial.print(soundDetected);
  Serial.print(",\"sound_value\":"); Serial.print(soundValue);
  Serial.print(",\"sound_msg\":\""); Serial.print(soundDetected ? "Co tieng dong" : "Yen lang"); Serial.print("\"");

  Serial.print(",\"light\":"); Serial.print(isBright);
  Serial.print(",\"light_value\":"); Serial.print(lightValue);
  Serial.print(",\"light_msg\":\""); Serial.print(isBright ? "Sang" : "Toi"); Serial.print("\"");

  Serial.print(",\"mq2\":"); Serial.print(gasDetected);
  Serial.print(",\"mq2_value\":"); Serial.print(mq2Value);
  Serial.print(",\"mq2_msg\":\""); Serial.print(gasDetected ? "Phat hien khi/gas" : "Binh thuong"); Serial.print("\"");

  Serial.print(",\"mq135\":"); Serial.print(badAir);
  Serial.print(",\"mq135_value\":"); Serial.print(mq135Value);
  Serial.print(",\"mq135_msg\":\""); Serial.print(badAir ? "Chat luong khong khi kem" : "Khong khi binh thuong"); Serial.print("\"");

  Serial.print(",\"dht_ok\":"); Serial.print(dhtOk);
  Serial.print(",\"temp\":"); Serial.print(temp, 1);
  Serial.print(",\"hum\":"); Serial.print(hum, 1);
  Serial.print(",\"dht_msg\":\"");
  Serial.print(dhtOk ? "DHT OK" : "DHT loi doc");
  Serial.print("\"");

  Serial.println("}");

  delay(2000);
}