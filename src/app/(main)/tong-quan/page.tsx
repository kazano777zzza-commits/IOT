"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/page-header";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, TrendingUp, WifiOff, Droplets } from "lucide-react";
import { HistoryStorage } from "@/lib/history-storage";


interface RawSensorData {
  temp: number | null;
  hum: number | null;
  mq135: number;
  light: number;
  sound: number;
  mq2: number;
}

export default function TongQuanPage() {
  const [data, setData] = useState<RawSensorData | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    recordsToday: 0,
    firstRecord: null as Date | null,
    lastRecord: null as Date | null,
    avgTemp: null as number | null,
    avgHum: null as number | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://192.168.4.1/data", {
          cache: "no-store",
        });
        if (response.ok) {
          const rawData = await response.json();
          setData(rawData);
          setOnline(true);
        } else {
          setOnline(false);
        }
      } catch (error) {
        setOnline(false);
      } finally {
        setLoading(false);
      }
    };

    // Load history stats
    const loadStats = () => {
      const today = new Date();
      const records = HistoryStorage.getByDate(today);
      
      if (records.length > 0) {
        const temps = records.filter(r => r.temp !== null).map(r => r.temp!);
        const hums = records.filter(r => r.hum !== null).map(r => r.hum!);
        
        setStats({
          recordsToday: records.length,
          firstRecord: new Date(records[records.length - 1].timestamp),
          lastRecord: new Date(records[0].timestamp),
          avgTemp: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : null,
          avgHum: hums.length > 0 ? hums.reduce((a, b) => a + b, 0) / hums.length : null,
        });
      }
    };

    fetchData();
    loadStats();
    const interval = setInterval(() => {
      fetchData();
      loadStats();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan"
        description="Trạng thái tổng thể môi trường phòng làm việc."
      />

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trạng thái kết nối</CardTitle>
            {online ? (
              <Badge className="bg-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Đang hoạt động
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Mất kết nối
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {online ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Bắt đầu ghi nhận
                </div>
                <div className="text-2xl font-bold">{formatTime(stats.firstRecord)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Cập nhật gần nhất
                </div>
                <div className="text-2xl font-bold">{formatTime(stats.lastRecord)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Số lần ghi nhận
                </div>
                <div className="text-2xl font-bold">{stats.recordsToday}</div>
                <div className="text-xs text-muted-foreground">lần hôm nay</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Nhiệt độ TB</div>
                <div className="text-2xl font-bold">
                  {stats.avgTemp !== null ? `${stats.avgTemp.toFixed(1)}°C` : "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Độ ẩm: {stats.avgHum !== null ? `${stats.avgHum.toFixed(1)}%` : "N/A"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <WifiOff className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không thể kết nối với ESP8266</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Vui lòng kiểm tra:<br />
                • Kết nối WiFi "IoT-Demo"<br />
                • ESP8266 đã được cấp nguồn<br />
                • Địa chỉ IP: 192.168.4.1
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sensor Metrics - Only show when online */}
      {online && data ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Nhiệt độ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.temp !== null ? `${data.temp.toFixed(1)}°C` : "N/A"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.temp !== null && data.temp >= 22 && data.temp <= 28 ? "✅ Nhiệt độ lý tưởng" : "⚠️ Ngoài phạm vi tối ưu"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Độ ẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.hum?.toFixed(1) ?? "--"}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.hum && data.hum >= 40 && data.hum <= 60 ? "✅ Độ ẩm tốt" : "⚠️ Cần điều chỉnh"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chất lượng không khí
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.mq135} PPM</div>
              <Badge variant={data.mq135 > 450 ? "destructive" : "outline"} className="mt-2">
                {data.mq135 > 450 ? "Kém" : data.mq135 > 200 ? "Trung bình" : "Tốt"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang kết nối với ESP8266...</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không có dữ liệu</h3>
            <p className="text-sm text-muted-foreground">
              Không thể hiển thị dữ liệu cảm biến khi mất kết nối.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
