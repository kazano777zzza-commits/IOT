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
    let status = 0; // 0=good, 1=warning, 2=danger

    // Temperature check
    if (data.temp !== null) {
      if (data.temp < 18 || data.temp > 32) {
        score -= 30;
        status = Math.max(status, 2);
        issues.push("Nhiệt độ bất thường");
      } else if (data.temp < 22 || data.temp > 28) {
        score -= 15;
        status = Math.max(status, 1);
      }
    }

    // Humidity check
    if (data.hum !== null) {
      if (data.hum < 30 || data.hum > 75) {
        score -= 25;
        status = Math.max(status, 2);
        issues.push("Độ ẩm nguy hiểm");
      } else if (data.hum < 40 || data.hum > 60) {
        score -= 10;
        status = Math.max(status, 1);
      }
    }

    // Air quality check
    if (data.mq135 > 450) {
      score -= 30;
      status = Math.max(status, 2);
      issues.push("Chất lượng không khí kém");
    } else if (data.mq135 > 200) {
      score -= 15;
      status = Math.max(status, 1);
    }

    // Gas/Smoke check (highest priority)
    if (data.mq2 === 1) {
      score = 0;
      status = 2;
      issues.unshift("PHÁT HIỆN GAS/KHÓI");
    }

    // Light check
    if (data.light === 0) {
      score -= 10;
      status = Math.max(status, 1);
    }

    // Noise check
    if (data.sound === 1) {
      score -= 15;
      status = Math.max(status, 2);
      issues.push("Tiếng ồn vượt ngưỡng");
    }

    const message = issues.length > 0 
      ? `⚠️ ${issues[0]}`
      : "✅ Môi trường làm việc đang thoải mái";

    return {
      index: Math.max(0, score),
      status,
      message,
      issues,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kết nối với ESP8266...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-destructive">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="font-semibold">Không thể kết nối ESP8266</p>
          <p className="text-sm mt-2">Kiểm tra kết nối WiFi "IoT-Demo"</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Simple level calculation (direct from raw)
  const getTempLevel = (temp: number | null) => {
    if (temp === null) return 0;
    if (temp >= 22 && temp <= 28) return 0;
    if ((temp >= 18 && temp < 22) || (temp > 28 && temp <= 32)) return 1;
    return 2;
  };

  const getHumLevel = (hum: number | null) => {
    if (hum === null) return 0;
    if (hum >= 40 && hum <= 60) return 0;
    if ((hum >= 30 && hum < 40) || (hum > 60 && hum <= 75)) return 1;
    return 2;
  };

  const getMq135Level = (val: number) => {
    if (val < 200) return 0;
    if (val <= 450) return 1;
    return 2;
  };

  const getLevelBadge = (level: number) => {
    if (level === 0) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Tốt</Badge>;
    if (level === 1) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">TB</Badge>;
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Nguy hiểm</Badge>;
  };

  const getStatusBadge = (value: number) => {
    return value === 1 
      ? <Badge className="bg-red-500">PHÁT HIỆN</Badge>
      : <Badge className="bg-green-500">Bình thường</Badge>;
  };

  const comfort = data ? calculateComfort(data) : { index: 0, status: 0, message: "", issues: [] };

  return (
    <>
      <AlertNotificationSystem 
        alerts={alerts} 
        onDismiss={dismissAlert}
        enableSound={true}
      />
      
      <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Dữ liệu RAW từ ESP8266</h2>
            <p className="text-muted-foreground">Hiển thị trực tiếp - Không qua xử lý</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
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
      />

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Temperature */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold">Nhiệt độ</h3>
            </div>
            {getLevelBadge(getTempLevel(data.temp))}
          </div>
          <div className="text-3xl font-bold mb-1">
            {data.temp !== null ? `${data.temp.toFixed(1)}°C` : "N/A"}
          </div>
          <div className="text-xs text-muted-foreground">Tốt: 22-28°C</div>
        </Card>

        {/* Humidity */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Độ ẩm</h3>
            </div>
            {getLevelBadge(getHumLevel(data.hum))}
          </div>
          <div className="text-3xl font-bold mb-1">
            {data.hum !== null ? `${data.hum.toFixed(1)}%` : "N/A"}
          </div>
          <div className="text-xs text-muted-foreground">Tốt: 40-60%</div>
        </Card>

        {/* Air Quality */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Chất lượng không khí</h3>
            </div>
            {getLevelBadge(getMq135Level(data.mq135))}
          </div>
          <div className="text-3xl font-bold mb-1">{data.mq135}</div>
          <div className="text-xs text-muted-foreground">PPM (analog 0-1023)</div>
        </Card>

        {/* Light */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Ánh sáng</h3>
            </div>
            {getStatusBadge(data.light)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {data.light === 1 ? "Đủ sáng" : "Thiếu sáng"}
          </div>
          <div className="text-xs text-muted-foreground">
            Digital: {data.light}
          </div>
        </Card>

        {/* Noise */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Tiếng ồn</h3>
            </div>
            {getStatusBadge(data.sound)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {data.sound === 1 ? "Ồn" : "Yên tĩnh"}
          </div>
          <div className="text-xs text-muted-foreground">
            Digital: {data.sound}
          </div>
        </Card>

        {/* Gas/Smoke */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold">Gas/Khói</h3>
            </div>
            {getStatusBadge(data.mq2)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {data.mq2 === 1 ? "PHÁT HIỆN" : "An toàn"}
          </div>
          <div className="text-xs text-muted-foreground">
            Digital: {data.mq2}
          </div>
        </Card>
      </div>

      {/* Raw JSON Display */}
      <Card className="p-4">
        <details open>
          <summary className="font-semibold cursor-pointer mb-2">📡 Raw JSON từ API</summary>
          <pre className="text-sm bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </Card>
    </div>
    </>
  );
}
