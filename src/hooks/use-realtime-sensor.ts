/**
 * React Hook: useRealtimeSensor
 * Polling API mỗi 1 giây để lấy dữ liệu realtime
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProcessedOutput } from "@/lib/sensor-processor";

interface SensorResponse {
  success: boolean;
  timestamp: string;
  raw?: {
    // Mapped data cho tương thích
    temp: number | null;
    hum: number | null;
    mq135: number;
    light: number;
    sound: number;
    mq2: number;
    // Dữ liệu mở rộng từ Arduino
    light_value?: number;
    sound_value?: number;
    mq2_value?: number;
    mq135_alert?: number;
    dht_ok?: number;
    // Messages từ Arduino
    sound_msg?: string;
    light_msg?: string;
    mq2_msg?: string;
    mq135_msg?: string;
    dht_msg?: string;
  };
  processed: ProcessedOutput;
  meta?: {
    sample_count: number;
    baseline_ready: boolean;
    baseline: number | null;
  };
  error?: string;
  fallback?: boolean;
}

export function useRealtimeSensor(pollingInterval = 1000) {
  const [data, setData] = useState<SensorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/sensor-data", {
        cache: "no-store",
      });

      const result: SensorResponse = await response.json();
      
      setData(result);
      setError(result.success ? null : result.error || "Unknown error");
      setLoading(false);

    } catch (err) {
      console.error("Failed to fetch sensor data:", err);
      setError(err instanceof Error ? err.message : "Network error");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Polling
    const intervalId = setInterval(fetchData, pollingInterval);

    return () => clearInterval(intervalId);
  }, [fetchData, pollingInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
