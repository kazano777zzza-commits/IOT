/**
 * API Route: GET /api/sensor-data
 * Fetch từ ESP8266 (http://192.168.4.1/data) và xử lý realtime
 */

import { NextResponse } from "next/server";
import { getSensorProcessor, type SensorInput } from "@/lib/sensor-processor";

const ESP8266_URL = "http://192.168.4.1/data";
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

    // Validate input
    if (typeof rawData.mq135 !== "number" || 
        typeof rawData.light !== "number" || 
        typeof rawData.sound !== "number" || 
        typeof rawData.mq2 !== "number") {
      throw new Error("Invalid sensor data format");
    }

    // Process qua thuật toán
    const processor = getSensorProcessor();
    const result = processor.process(rawData);

    // Log để debug
    console.log(`[${new Date().toISOString()}] Sample #${processor.getSampleCount()}`);
    console.log(`  Raw: T=${rawData.temp}°C H=${rawData.hum}% MQ135=${rawData.mq135}`);
    console.log(`  Room Status: ${result.room_status} | Comfort: ${result.comfort_index}`);
    console.log(`  Message: ${result.message}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      raw: rawData,
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
