/**
 * API Route: GET /api/sensor-data
 * Fetch từ Arduino qua ESP8266 (http://192.168.4.1/log) và xử lý realtime
 * 
 * Format dữ liệu từ Arduino:
 * {
 *   "sound": 0|1, "sound_value": number, "sound_msg": string,
 *   "light": 0|1, "light_value": number, "light_msg": string,
 *   "mq2": 0|1, "mq2_value": number, "mq2_msg": string,
 *   "mq135": 0|1, "mq135_value": number, "mq135_msg": string,
 *   "dht_ok": 0|1, "temp": number, "hum": number, "dht_msg": string
 * }
 */

import { NextResponse } from "next/server";
import { getSensorProcessor, type SensorInput } from "@/lib/sensor-processor";

const ESP8266_URL = "http://192.168.4.1/log";
const TIMEOUT_MS = 5000;

export async function GET() {
  try {
    // Fetch data từ ESP8266
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(ESP8266_URL, {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ESP8266 returned status ${response.status}`);
    }

    const rawData: SensorInput = await response.json();

    // Validate input - kiểm tra các trường bắt buộc
    if (typeof rawData.sound !== "number" || 
        typeof rawData.sound_value !== "number" ||
        typeof rawData.light !== "number" || 
        typeof rawData.light_value !== "number" ||
        typeof rawData.mq2 !== "number" || 
        typeof rawData.mq2_value !== "number" ||
        typeof rawData.mq135 !== "number" ||
        typeof rawData.mq135_value !== "number" ||
        typeof rawData.dht_ok !== "number" ||
        typeof rawData.temp !== "number" ||
        typeof rawData.hum !== "number") {
      throw new Error("Invalid sensor data format from Arduino");
    }

    // Process qua thuật toán
    const processor = getSensorProcessor();
    const result = processor.process(rawData);

    // Log để debug
    console.log(`[${new Date().toISOString()}] Sample #${processor.getSampleCount()}`);
    console.log(`  Raw: T=${rawData.temp}°C H=${rawData.hum}% MQ135=${rawData.mq135_value} DHT_OK=${rawData.dht_ok}`);
    console.log(`  Room Status: ${result.room_status} | Comfort: ${result.comfort_index}`);
    console.log(`  Message: ${result.message}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      raw: {
        // Map sang format cũ để tương thích với frontend
        temp: rawData.dht_ok === 1 ? rawData.temp : null,
        hum: rawData.dht_ok === 1 ? rawData.hum : null,
        mq135: rawData.mq135_value,
        light: rawData.light,
        sound: rawData.sound,
        mq2: rawData.mq2,
        // Thêm các trường mới
        light_value: rawData.light_value,
        sound_value: rawData.sound_value,
        mq2_value: rawData.mq2_value,
        mq135_alert: rawData.mq135,
        dht_ok: rawData.dht_ok,
        // Messages từ Arduino
        sound_msg: rawData.sound_msg,
        light_msg: rawData.light_msg,
        mq2_msg: rawData.mq2_msg,
        mq135_msg: rawData.mq135_msg,
        dht_msg: rawData.dht_msg,
      },
      processed: result,
      meta: {
        sample_count: processor.getSampleCount(),
        baseline_ready: processor.isBaselineReady(),
        baseline: processor.getBaseline(),
      },
    });

  } catch (error) {
    console.error("❌ Error fetching sensor data:", error);

    // Return fallback data
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      fallback: true,
      processed: {
        avg: { temp: null, hum: null, mq135: 0 },
        stable: { light: 0, sound: 0, mq2: 0 },
        level: { temp: 0, hum: 0, air: 0, light: 0, noise: 0, gas: 0 },
        alert: { temp: 0, hum: 0, air: 0, light: 0, noise: 0, gas: 0 },
        room_status: 0,
        comfort_index: 0,
        message: "⚠️ Không thể kết nối với ESP8266. Kiểm tra kết nối WiFi.",
      },
    }, { status: 503 });
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
