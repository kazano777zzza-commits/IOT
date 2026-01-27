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
  // Các trường mở rộng từ Arduino
  light_value?: number;
  sound_value?: number;
  mq2_value?: number;
  mq135_alert?: number;
  dht_ok?: number;
  sound_msg?: string;
  light_msg?: string;
  mq2_msg?: string;
  mq135_msg?: string;
  dht_msg?: string;
}

// Sử dụng API route thay vì gọi trực tiếp ESP8266
const API_URL = "/api/sensor-data";

export function RawSensorDisplay() {
  const [data, setData] = useState<RawSensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { alerts, addAlert, dismissAlert, clearDanger } = useAlerts();

  // Calculate comfort index and room status
  // Tổng điểm tối đa: 100 điểm
  // Phân bổ: Nhiệt độ 20đ, Độ ẩm 20đ, Không khí 20đ, Ánh sáng 15đ, Tiếng ồn 10đ, Gas 15đ
  const calculateComfort = (data: RawSensorData) => {
    // Điểm tối đa cho mỗi chỉ số
    const MAX_POINTS = {
      temp: 20,
      humidity: 20,
      airQuality: 20,
      light: 15,
      noise: 10,
      gas: 15
    };
    
    // Track điểm đạt được cho mỗi chỉ số (bắt đầu từ max)
    let points = {
      temp: MAX_POINTS.temp,
      humidity: MAX_POINTS.humidity,
      airQuality: MAX_POINTS.airQuality,
      light: MAX_POINTS.light,
      noise: MAX_POINTS.noise,
      gas: MAX_POINTS.gas
    };
    
    let issues: string[] = [];

    // === NHIỆT ĐỘ (20 điểm) ===
    // Tốt: 22-28°C (20đ), Bình thường: 18-32°C (15đ), Trung bình: 15-35°C (10đ), Xấu: còn lại (5đ)
    if (data.temp !== null) {
      if (data.temp >= 22 && data.temp <= 28) {
        points.temp = 20;  // Tốt - full điểm
      } else if (data.temp >= 18 && data.temp <= 32) {
        points.temp = 15;  // Bình thường
      } else if (data.temp >= 15 && data.temp <= 35) {
        points.temp = 10;  // Trung bình
      } else {
        points.temp = 5;   // Xấu
        issues.push("Nhiệt độ không tốt");
      }
    } else {
      points.temp = 0;  // Không có dữ liệu
    }

    // === ĐỘ ẨM (20 điểm) ===
    // Tốt: 40-60% (20đ), Bình thường: 30-70% (15đ), Trung bình: 20-85% (10đ), Xấu: còn lại (5đ)
    if (data.hum !== null) {
      if (data.hum >= 40 && data.hum <= 60) {
        points.humidity = 20;  // Tốt - full điểm
      } else if (data.hum >= 30 && data.hum <= 70) {
        points.humidity = 15;  // Bình thường
      } else if (data.hum >= 20 && data.hum <= 85) {
        points.humidity = 10;  // Trung bình
      } else {
        points.humidity = 5;   // Xấu
        issues.push("Độ ẩm không phù hợp");
      }
    } else {
      points.humidity = 0;  // Không có dữ liệu
    }

    // === CHẤT LƯỢNG KHÔNG KHÍ MQ135 (20 điểm) ===
    // Tốt: <300 (20đ), Bình thường: 300-450 (15đ), Trung bình: 450-600 (10đ), Xấu: >600 (5đ)
    if (data.mq135 < 300) {
      points.airQuality = 20;  // Tốt
    } else if (data.mq135 < 450) {
      points.airQuality = 15;  // Bình thường
    } else if (data.mq135 < 600) {
      points.airQuality = 10;  // Trung bình
    } else {
      points.airQuality = 5;   // Xấu
      issues.push("Chất lượng không khí kém");
    }

    // === ÁNH SÁNG (15 điểm) ===
    // light=0 là đủ sáng (15đ), light=1 là thiếu sáng (0đ) - XẤU
    if (data.light === 0) {
      points.light = 15;  // Đủ sáng - full điểm
    } else {
      points.light = 0;   // Thiếu sáng - XẤU
      issues.push("Thiếu ánh sáng");
    }

    // === TIẾNG ỒN (10 điểm) ===
    // sound=0 là yên tĩnh (10đ), sound=1 là có tiếng ồn (0đ)
    if (data.sound === 0) {
      points.noise = 10;  // Yên tĩnh - full điểm
    } else {
      points.noise = 0;   // Có tiếng ồn
    }

    // === GAS/KHÓI MQ2 (15 điểm) ===
    // mq2=0 là an toàn (15đ), mq2=1 là có gas (0đ + NGUY HIỂM)
    if (data.mq2 === 0) {
      points.gas = 15;  // An toàn - full điểm
    } else {
      points.gas = 0;   // NGUY HIỂM
      issues.unshift("⚠️ PHÁT HIỆN GAS/KHÓI - NGUY HIỂM!");
    }

    // Tính tổng điểm
    const totalScore = points.temp + points.humidity + points.airQuality + 
                       points.light + points.noise + points.gas;

    // Determine status based on score ranges
    // 0=Tốt (80-100), 1=Bình thường (60-79), 2=Trung bình (40-59), 3=Xấu (20-39), 4=Nguy hiểm (0-19)
    let status = 0;
    if (data.mq2 === 1) {
      status = 4;  // Gas luôn là nguy hiểm
    } else if (totalScore >= 80) {
      status = 0;  // Tốt
    } else if (totalScore >= 60) {
      status = 1;  // Bình thường
    } else if (totalScore >= 40) {
      status = 2;  // Trung bình
    } else if (totalScore >= 20) {
      status = 3;  // Xấu
    } else {
      status = 4;  // Nguy hiểm
    }

    const message = issues.length > 0 
      ? `${issues[0]}`
      : "✅ Môi trường làm việc đang thoải mái";

    return {
      index: totalScore,
      status,
      message,
      issues,
      breakdown: points,
      maxPoints: MAX_POINTS
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const apiResult = await response.json();
        
        // Nếu API trả về lỗi
        if (!apiResult.success) {
          throw new Error(apiResult.error || "API Error");
        }

        // Lấy raw data từ API response
        const result: RawSensorData = apiResult.raw;
        setData(result);
        setError(null);
        setLoading(false);
        setLastUpdate(new Date());

        // Calculate comfort and check for alerts
        const comfort = calculateComfort(result);
        
        // Kiểm tra các điều kiện NGUY HIỂM (chỉ Gas, Nhiệt độ cực đoan, Không khí xấu)
        let dangerDetected = false;
        let dangerType = "";
        let dangerMessage = "";

        // 1. GAS - ưu tiên cao nhất
        if (result.mq2 === 1) {
          dangerDetected = true;
          dangerType = "gas";
          dangerMessage = "⚠️ PHÁT HIỆN GAS/KHÓI - Kiểm tra ngay!";
        }
        // 2. Nhiệt độ cực đoan (< 15°C hoặc > 38°C)
        else if (result.temp !== null && (result.temp < 15 || result.temp > 38)) {
          dangerDetected = true;
          dangerType = "temp";
          dangerMessage = `🌡️ Nhiệt độ nguy hiểm: ${result.temp}°C`;
        }
        // 3. Không khí rất xấu (MQ135 > 800)
        else if (result.mq135 > 800) {
          dangerDetected = true;
          dangerType = "air";
          dangerMessage = `💨 Chất lượng không khí nguy hiểm: ${result.mq135} PPM`;
        }

        // Chỉ hiện 1 cảnh báo duy nhất, và xóa khi hết nguy hiểm
        if (dangerDetected) {
          addAlert("danger", "🚨 NGUY HIỂM", dangerMessage, dangerType);
        } else {
          // Hết nguy hiểm -> xóa cảnh báo
          clearDanger();
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
  // 0=Tốt, 1=Bình thường, 2=Trung bình, 3=Xấu, 4=Nguy hiểm
  const getTempStatus = (temp: number | null) => {
    if (temp === null) return 0;
    if (temp >= 22 && temp <= 28) return 0; // Tốt
    if ((temp >= 18 && temp < 22) || (temp > 28 && temp <= 32)) return 1; // Bình thường
    if ((temp >= 15 && temp < 18) || (temp > 32 && temp <= 38)) return 3; // Xấu
    return 4; // Nguy hiểm
  };

  const getHumStatus = (hum: number | null) => {
    if (hum === null) return 0;
    if (hum >= 40 && hum <= 60) return 0; // Tốt
    if ((hum >= 30 && hum < 40) || (hum > 60 && hum <= 80)) return 1; // Bình thường
    if ((hum >= 20 && hum < 30) || (hum > 80 && hum <= 90)) return 2; // Trung bình
    return 3; // Xấu (không phải nguy hiểm)
  };

  const getAirQualityStatus = (val: number) => {
    if (val < 300) return 0; // Tốt
    if (val < 450) return 1; // Bình thường
    if (val < 600) return 2; // Trung bình
    if (val < 800) return 3; // Xấu
    return 4; // Nguy hiểm
  };

  // Light: light=1 là tối, light=0 là sáng
  const getLightStatus = (value: number) => {
    return value === 1 ? 1 : 0; // Tối=Bình thường, Sáng=Tốt
  };

  // Sound: sound=1 là ồn
  const getSoundStatus = (value: number) => {
    return value === 1 ? 1 : 0; // Ồn=Bình thường, Yên tĩnh=Tốt
  };

  // Gas: mq2=1 là phát hiện gas -> NGUY HIỂM
  const getGasStatus = (value: number) => {
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
    breakdown: { temp: 0, humidity: 0, airQuality: 0, light: 0, noise: 0, gas: 0 },
    maxPoints: { temp: 20, humidity: 20, airQuality: 20, light: 15, noise: 10, gas: 15 }
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
        maxPoints={comfort.maxPoints}
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
        </Card>

        {/* Light */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Ánh sáng</h3>
            </div>
            {getStatusBadge(getLightStatus(data.light))}
          </div>
          <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">
            {data.light === 0 ? "Đủ sáng" : "Thiếu sáng"}
          </div>

        </Card>

        {/* Noise */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Tiếng ồn</h3>
            </div>
            {getStatusBadge(getSoundStatus(data.sound))}
          </div>
          <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">
            {data.sound === 1 ? "Ồn" : "Yên tĩnh"}
          </div>

        </Card>

        {/* Gas/Smoke */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Gas/Khói</h3>
            </div>
            {getStatusBadge(getGasStatus(data.mq2))}
          </div>
          <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">
            {data.mq2 === 1 ? "⚠️ PHÁT HIỆN" : "An toàn"}
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
