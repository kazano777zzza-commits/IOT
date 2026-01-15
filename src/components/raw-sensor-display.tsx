/**
 * Component: RawSensorDisplay
 * Hiển thị dữ liệu RAW trực tiếp từ ESP8266 - KHÔNG qua xử lý
 */

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Thermometer, Droplets, Wind, Lightbulb, Volume2, Flame } from "lucide-react";
import { HistoryStorage } from "@/lib/history-storage";
import { ComfortIndexCard } from "@/components/dashboard/comfort-index-card";
import { AlertNotificationSystem, useAlerts } from "@/components/alert-notification-system";

interface RawSensorData {
  temp: number | null;
  hum: number | null;
  mq135: number;
  light: number;
  sound: number;
  mq2: number;
}

const ESP8266_URL = "http://192.168.4.1/data";

export function RawSensorDisplay() {
  const [data, setData] = useState<RawSensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { alerts, addAlert, dismissAlert } = useAlerts();

  // Calculate comfort index and room status
  const calculateComfort = (data: RawSensorData) => {
    let score = 100;
    let issues: string[] = [];
    
    // Track points deducted per sensor for breakdown
    let breakdown = {
      temp: 0,
      humidity: 0,
      airQuality: 0,
      light: 0,
      noise: 0,
      gas: 0
    };

    // Temperature check
    if (data.temp !== null) {
      if (data.temp < 18 || data.temp > 32) {
        breakdown.temp = 30;
        score -= 30;
        issues.push("Nhiệt độ bất thường");
      } else if (data.temp < 22 || data.temp > 28) {
        breakdown.temp = 15;
        score -= 15;
      }
    }

    // Humidity check
    if (data.hum !== null) {
      if (data.hum < 30 || data.hum > 75) {
        breakdown.humidity = 25;
        score -= 25;
        issues.push("Độ ẩm nguy hiểm");
      } else if (data.hum < 40 || data.hum > 60) {
        breakdown.humidity = 10;
        score -= 10;
      }
    }

    // Air quality check
    if (data.mq135 > 450) {
      breakdown.airQuality = 30;
      score -= 30;
      issues.push("Chất lượng không khí kém");
    } else if (data.mq135 > 200) {
      breakdown.airQuality = 15;
      score -= 15;
    }

    // Gas/Smoke check (highest priority)
    if (data.mq2 === 1) {
      breakdown.gas = 100;
      score = 0;
      issues.unshift("PHÁT HIỆN GAS/KHÓI");
    }

    // Light check
    if (data.light === 0) {
      breakdown.light = 10;
      score -= 10;
    }

    // Noise check
    if (data.sound === 1) {
      breakdown.noise = 15;
      score -= 15;
      issues.push("Tiếng ồn vượt ngưỡng");
    }

    // Ensure score is within bounds
    score = Math.max(0, score);

    // Determine status ONLY based on final score ranges
    // 0=Tốt (80-100), 1=Bình thường (60-79), 2=Trung bình (40-59), 3=Xấu (20-39), 4=Nguy hiểm (0-19)
    let status = 0;
    if (score >= 80) {
      status = 0;
    } else if (score >= 60) {
      status = 1;
    } else if (score >= 40) {
      status = 2;
    } else if (score >= 20) {
      status = 3;
    } else {
      status = 4;
    }

    const message = issues.length > 0 
      ? `⚠️ ${issues[0]}`
      : "✅ Môi trường làm việc đang thoải mái";

    return {
      index: score,
      status,
      message,
      issues,
      breakdown,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ESP8266_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: RawSensorData = await response.json();
        setData(result);
        setError(null);
        setLoading(false);
        setLastUpdate(new Date());

        // Calculate comfort and check for alerts
        const comfort = calculateComfort(result);
        
        // Trigger alerts for dangerous conditions
        if (comfort.status === 2 && comfort.issues.length > 0) {
          comfort.issues.forEach(issue => {
            addAlert("danger", "CẢNH BÁO", issue);
          });
        }

        // Lưu vào lịch sử
        HistoryStorage.addRecord({
          temp: result.temp,
          hum: result.hum,
          mq135: result.mq135,
          light: result.light,
          sound: result.sound,
          mq2: result.mq2,
        });

      } catch (err) {
        console.error("Failed to fetch:", err);
        setError(err instanceof Error ? err.message : "Network error");
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Polling mỗi 1 giây
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Đang kết nối với ESP8266...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600 dark:text-red-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="font-semibold">Không thể kết nối ESP8266</p>
          <p className="text-sm mt-2 text-slate-700 dark:text-slate-300">Kiểm tra kết nối WiFi "IoT-Demo"</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate status (0-4) for each individual sensor based on thresholds
  const getTempStatus = (temp: number | null) => {
    if (temp === null) return 0;
    if (temp >= 22 && temp <= 28) return 0; // Tốt
    if ((temp >= 18 && temp < 22) || (temp > 28 && temp <= 32)) return 1; // Bình thường
    return 4; // Nguy hiểm
  };

  const getHumStatus = (hum: number | null) => {
    if (hum === null) return 0;
    if (hum >= 40 && hum <= 60) return 0; // Tốt
    if ((hum >= 30 && hum < 40) || (hum > 60 && hum <= 75)) return 1; // Bình thường
    return 4; // Nguy hiểm
  };

  const getAirQualityStatus = (val: number) => {
    if (val < 150) return 0; // Tốt
    if (val < 250) return 2; // Trung bình
    if (val < 350) return 3; // Xấu
    return 4; // Nguy hiểm
  };

  const getDigitalSensorStatus = (value: number) => {
    return value === 1 ? 4 : 0; // Phát hiện=Nguy hiểm, Bình thường=Tốt
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return "bg-green-600";
      case 1: return "bg-green-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-orange-500";
      case 4: return "bg-red-600";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return <Badge className={`${getStatusColor(0)} text-white`}>🟢 Tốt</Badge>;
      case 1: return <Badge className={`${getStatusColor(1)} text-white`}>🟡 Bình thường</Badge>;
      case 2: return <Badge className={`${getStatusColor(2)} text-white`}>🟠 Trung bình</Badge>;
      case 3: return <Badge className={`${getStatusColor(3)} text-white`}>🔴 Xấu</Badge>;
      case 4: return <Badge className={`${getStatusColor(4)} text-white`}>⛔ Nguy hiểm</Badge>;
      default: return <Badge className="bg-gray-500 text-white">N/A</Badge>;
    }
  };

  const comfort = data ? calculateComfort(data) : { 
    index: 0, 
    status: 0, 
    message: "", 
    issues: [], 
    breakdown: { temp: 0, humidity: 0, airQuality: 0, light: 0, noise: 0, gas: 0 }
  };

  return (
    <>
      <AlertNotificationSystem 
        alerts={alerts} 
        onDismiss={dismissAlert}
        enableSound={true}
      />
      
      <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Dữ liệu RAW từ ESP8266</h2>
            <p className="text-slate-600 dark:text-slate-400">Hiển thị trực tiếp - Không qua xử lý</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {lastUpdate && `Cập nhật: ${lastUpdate.toLocaleTimeString("vi-VN")}`}
            </div>
          </div>
        </div>
      </Card>

      {/* Comfort Index Card */}
      <ComfortIndexCard 
        index={comfort.index}
        status={comfort.status}
        message={comfort.message}
        breakdown={comfort.breakdown}
      />

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Temperature */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Nhiệt độ</h3>
            </div>
            {getStatusBadge(getTempStatus(data.temp))}
          </div>
          <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">
            {data.temp !== null ? `${data.temp.toFixed(1)}°C` : "N/A"}
          </div>
          <div className="text-xs text-muted-foreground">Tốt: 22-28°C</div>
        </Card>

        {/* Humidity */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Độ ẩm</h3>
            </div>
            {getStatusBadge(getHumStatus(data.hum))}
          </div>
          <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">
            {data.hum !== null ? `${data.hum.toFixed(1)}%` : "N/A"}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Tốt: 40-60%</div>
        </Card>

        {/* Air Quality */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Chất lượng không khí</h3>
            </div>
            {getStatusBadge(getAirQualityStatus(data.mq135))}
          </div>
          <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">{data.mq135}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">PPM (analog 0-1023)</div>
        </Card>

        {/* Light */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Ánh sáng</h3>
            </div>
            {getStatusBadge(getDigitalSensorStatus(data.light))}
          </div>
          <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">
            {data.light === 1 ? "Đủ sáng" : "Thiếu sáng"}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Digital: {data.light}
          </div>
        </Card>

        {/* Noise */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Tiếng ồn</h3>
            </div>
            {getStatusBadge(getDigitalSensorStatus(data.sound))}
          </div>
          <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">
            {data.sound === 1 ? "Ồn" : "Yên tĩnh"}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Digital: {data.sound}
          </div>
        </Card>

        {/* Gas/Smoke */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Gas/Khói</h3>
            </div>
            {getStatusBadge(getDigitalSensorStatus(data.mq2))}
          </div>
          <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">
            {data.mq2 === 1 ? "PHÁT HIỆN" : "An toàn"}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Digital: {data.mq2}
          </div>
        </Card>
      </div>

      {/* Raw JSON Display */}
      <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <details open>
          <summary className="font-semibold cursor-pointer mb-2 text-slate-900 dark:text-white">📡 Raw JSON từ API</summary>
          <pre className="text-sm bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto text-slate-900 dark:text-slate-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </Card>
    </div>
    </>
  );
}
