/**
 * API Route: GET /api/sensor-data
 * ✅ Đọc dữ liệu từ Serial Bridge Server (chạy riêng)
 * 
 * Serial Bridge Server: node serial-bridge.js
 * Bridge API: http://localhost:3001/data
 */

import { NextResponse } from "next/server";
import { getSensorProcessor, type SensorInput } from "@/lib/sensor-processor";

// Telegram service (dynamic import to avoid build issues)
let telegramService: any = null;
let telegramInitialized = false;

async function initTelegram() {
  if (telegramInitialized) return;
  
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (token && chatId) {
      const { initTelegramService } = await import('@/lib/telegram-service');
      telegramService = initTelegramService(token, chatId);
      await telegramService.testConnection();
    }
    telegramInitialized = true;
  } catch (error) {
    console.error('⚠️ Không thể khởi tạo Telegram:', error);
    telegramInitialized = true; // Đánh dấu đã thử init
  }
}

// URL của Serial Bridge Server (chạy riêng với Next.js)
const BRIDGE_URL = process.env.BRIDGE_URL || "http://localhost:3001/data";
const TIMEOUT_MS = 3000;

/**
 * Fetch dữ liệu từ Serial Bridge Server
 */
async function fetchFromBridge(): Promise<SensorInput> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const response = await fetch(BRIDGE_URL, {
    signal: controller.signal,
    cache: "no-store",
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Bridge server returned status ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Bridge server error');
  }

  return result;
}

export async function GET() {
  try {
    // Khởi tạo Telegram nếu chưa
    if (!telegramInitialized) {
      await initTelegram();
    }

    // Fetch data từ Bridge Server
    const rawData: SensorInput = await fetchFromBridge();

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

    // ✅ Kiểm tra và gửi cảnh báo Telegram nếu cần
    if (telegramService) {
      try {
        await telegramService.checkAndSendAlerts(result, rawData);
      } catch (telegramError) {
        console.error('⚠️ Lỗi gửi Telegram alert:', telegramError);
      }
    }

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
