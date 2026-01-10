/**
 * Component: RealtimeDashboard
 * Hiển thị dữ liệu realtime từ ESP8266 theo form chuẩn
 */

"use client";

import { useRealtimeSensor } from "@/hooks/use-realtime-sensor";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, Thermometer, Droplets, Wind, Lightbulb, Volume2, Flame } from "lucide-react";

export function RealtimeDashboard() {
  const { data, loading, error } = useRealtimeSensor(1000);

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

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-destructive">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Không thể tải dữ liệu cảm biến</p>
        </div>
      </div>
    );
  }

  const { processed, meta, raw } = data;

  // Helper function for level badge
  const getLevelBadge = (level: number) => {
    if (level === 0) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Tốt</Badge>;
    if (level === 1) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Trung bình</Badge>;
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Nguy hiểm</Badge>;
  };

  const getRoomStatusBadge = (status: number) => {
    if (status === 0) return <Badge className="bg-green-500"><CheckCircle2 className="h-4 w-4 mr-1" /> Tốt</Badge>;
    if (status === 1) return <Badge className="bg-yellow-500"><AlertTriangle className="h-4 w-4 mr-1" /> Cảnh báo</Badge>;
    return <Badge className="bg-red-500"><AlertCircle className="h-4 w-4 mr-1" /> Nguy hiểm</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Trạng thái môi trường</h2>
            <p className="text-lg text-muted-foreground">{processed.message}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">{getRoomStatusBadge(processed.room_status)}</div>
            <div className="text-3xl font-bold text-primary">{processed.comfort_index}</div>
            <div className="text-sm text-muted-foreground">Comfort Index</div>
          </div>
        </div>

        {/* Meta info */}
        {meta && (
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground flex gap-4">
            <span>Mẫu: #{meta.sample_count}</span>
            <span>Baseline: {meta.baseline_ready ? `${meta.baseline}` : "Đang thiết lập..."}</span>
            <span className="ml-auto">Cập nhật: {new Date(data.timestamp).toLocaleTimeString("vi-VN")}</span>
          </div>
        )}
      </Card>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Temperature */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold">Nhiệt độ</h3>
            </div>
            {getLevelBadge(processed.level.temp)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {raw && raw.temp !== null ? `${raw.temp.toFixed(1)}°C` : "N/A"}
          </div>
          <div className="text-xs text-muted-foreground">
            {processed.avg.temp !== null && raw && raw.temp !== null && Math.abs(processed.avg.temp - raw.temp) > 0.1 
              ? `Trung bình 5 mẫu: ${processed.avg.temp.toFixed(1)}°C` 
              : "Tốt: 22-28°C"}
          </div>
        </Card>

        {/* Humidity */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Độ ẩm</h3>
            </div>
            {getLevelBadge(processed.level.hum)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {raw && raw.hum !== null ? `${raw.hum.toFixed(1)}%` : "N/A"}
          </div>
          <div className="text-xs text-muted-foreground">
            {processed.avg.hum !== null && raw && raw.hum !== null && Math.abs(processed.avg.hum - raw.hum) > 0.1 
              ? `Trung bình 5 mẫu: ${processed.avg.hum.toFixed(1)}%` 
              : "Tốt: 40-60%"}
          </div>
        </Card>

        {/* Air Quality */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Chất lượng không khí</h3>
            </div>
            {getLevelBadge(processed.level.air)}
          </div>
          <div className="text-3xl font-bold mb-1">{processed.avg.mq135}</div>
          <div className="text-xs text-muted-foreground">
            {meta?.baseline ? `Baseline: ${meta.baseline}` : "PPM (analog)"}
          </div>
        </Card>

        {/* Light */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Ánh sáng</h3>
            </div>
            {getLevelBadge(processed.level.light)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {processed.stable.light === 1 ? "Đủ sáng" : "Thiếu sáng"}
          </div>
          <div className="text-xs text-muted-foreground">
            {processed.alert.light ? "⚠️ Cần bật đèn" : "✓ Bình thường"}
          </div>
        </Card>

        {/* Noise */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Tiếng ồn</h3>
            </div>
            {getLevelBadge(processed.level.noise)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {processed.stable.sound === 1 ? "Ồn" : "Yên tĩnh"}
          </div>
          <div className="text-xs text-muted-foreground">
            {processed.alert.noise ? "⚠️ Vượt ngưỡng" : "✓ Bình thường"}
          </div>
        </Card>

        {/* Gas/Smoke */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold">Gas/Khói</h3>
            </div>
            {getLevelBadge(processed.level.gas)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {processed.stable.mq2 === 1 ? "PHÁT HIỆN" : "An toàn"}
          </div>
          <div className="text-xs text-muted-foreground">
            {processed.alert.gas ? "⚠️ CẢNH BÁO" : "✓ Bình thường"}
          </div>
        </Card>
      </div>

      {/* Raw Data Debug (Optional) */}
      {raw && (
        <Card className="p-4">
          <details>
            <summary className="font-semibold cursor-pointer">🔍 Raw Data (Debug)</summary>
            <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
              {JSON.stringify({ raw, processed }, null, 2)}
            </pre>
          </details>
        </Card>
      )}
    </div>
  );
}
