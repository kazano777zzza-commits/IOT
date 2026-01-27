"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  WifiOff,
  Activity,
  Clock,
  Signal,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface DeviceStatus {
  online: boolean;
  lastSeen: Date | null;
  responseTime: number | null;
  totalRequests: number;
  errorCount: number;
  successCount: number;
}

export default function ThietBiPage() {
  const [status, setStatus] = useState<DeviceStatus>({
    online: false,
    lastSeen: null,
    responseTime: null,
    totalRequests: 0,
    errorCount: 0,
    successCount: 0,
  });
  const [checking, setChecking] = useState(false);
  const [latestData, setLatestData] = useState<any>(null);

  const checkConnection = async () => {
    setChecking(true);
    const startTime = Date.now();

    try {
      // Sử dụng API route thay vì gọi trực tiếp ESP8266
      const response = await fetch("/api/sensor-data", {
        cache: "no-store",
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const result = await response.json();

      if (result.success) {
        setStatus((prev) => ({
          ...prev,
          online: true,
          lastSeen: new Date(),
          responseTime,
          totalRequests: prev.totalRequests + 1,
          successCount: prev.successCount + 1,
        }));
        setLatestData(result.raw);
      } else {
        throw new Error(result.error || "API Error");
      }
    } catch (error) {
      console.error("Connection check failed:", error);
      setStatus((prev) => ({
        ...prev,
        online: false,
        responseTime: null,
        totalRequests: prev.totalRequests + 1,
        errorCount: prev.errorCount + 1,
      }));
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    if (status.online) {
      return (
        <Badge className="bg-green-500 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Đang hoạt động
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Mất kết nối
      </Badge>
    );
  };

  const getSignalStrength = () => {
    if (!status.responseTime) return 0;
    if (status.responseTime < 100) return 100;
    if (status.responseTime < 300) return 75;
    if (status.responseTime < 500) return 50;
    return 25;
  };

  const signalStrength = getSignalStrength();

  const getSignalBars = () => {
    const bars = Math.ceil(signalStrength / 25);
    return (
      <div className="flex items-end gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1.5 rounded-t transition-all ${
              bar <= bars ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
            style={{ height: `${bar * 6}px` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trạng thái thiết bị"
        description="Giám sát kết nối và hiệu suất ESP8266."
      />

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Trạng thái</p>
                <div className="mt-2">{getStatusBadge()}</div>
              </div>
              {status.online ? (
                <Activity className="h-8 w-8 text-green-500 animate-pulse" />
              ) : (
                <WifiOff className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Thời gian phản hồi</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {status.responseTime ? `${status.responseTime}ms` : "N/A"}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cường độ tín hiệu</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{signalStrength}%</p>
              </div>
              <div className="flex items-center gap-2">
                {getSignalBars()}
                <Signal className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Lần kiểm tra cuối</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {status.lastSeen
                    ? status.lastSeen.toLocaleTimeString("vi-VN")
                    : "Chưa kết nối"}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Information */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white">Thông tin thiết bị</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnection}
              disabled={checking}
              className="dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Connection Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Địa chỉ IP</p>
                <p className="text-lg font-mono text-slate-900 dark:text-white">192.168.4.1</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">WiFi SSID</p>
                <p className="text-lg text-slate-900 dark:text-white">IoT-Demo</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loại thiết bị</p>
                <p className="text-lg text-slate-900 dark:text-white">ESP8266 NodeMCU</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tổng số yêu cầu</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.totalRequests}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Số lỗi</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.errorCount}</p>
                  {status.errorCount > 10 && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tỷ lệ thành công</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {status.totalRequests > 0
                    ? Math.round(
                        ((status.totalRequests - status.errorCount) / status.totalRequests) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Quality & Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">Chất lượng kết nối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-900 dark:text-white">Độ trễ</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {status.responseTime
                      ? status.responseTime < 200
                        ? "Tốt"
                        : status.responseTime < 500
                        ? "Trung bình"
                        : "Chậm"
                      : "N/A"}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      !status.responseTime
                        ? "bg-gray-400"
                        : status.responseTime < 200
                        ? "bg-green-500"
                        : status.responseTime < 500
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: status.responseTime
                        ? `${Math.min(100, (status.responseTime / 1000) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-900 dark:text-white">Độ ổn định</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {status.totalRequests > 0
                      ? status.errorCount / status.totalRequests < 0.1
                        ? "Ổn định"
                        : "Không ổn định"
                      : "N/A"}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      status.totalRequests > 0 && status.errorCount / status.totalRequests < 0.1
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${
                        status.totalRequests > 0
                          ? 100 - (status.errorCount / status.totalRequests) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white">Hướng dẫn kết nối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-purple-600/20 dark:bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">1</span>
                </div>
                <p className="text-slate-900 dark:text-white">Kết nối WiFi vào mạng <strong>"IoT-Demo"</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-purple-600/20 dark:bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">2</span>
                </div>
                <p className="text-slate-900 dark:text-white">Mật khẩu: <strong>12345678</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-purple-600/20 dark:bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <p className="text-slate-900 dark:text-white">
                  ESP8266 có địa chỉ IP: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-900 dark:text-white">192.168.4.1</code>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-purple-600/20 dark:bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">4</span>
                </div>
                <p className="text-slate-900 dark:text-white">Dashboard sẽ tự động kết nối và hiển thị dữ liệu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Sensor Data Preview */}
      {status.online && latestData && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500 animate-pulse" />
              Dữ liệu sensor trực tiếp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-xl font-bold text-orange-600">
                  {latestData.temp !== null ? `${latestData.temp}°C` : "N/A"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Nhiệt độ</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {latestData.hum !== null ? `${latestData.hum}%` : "N/A"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Độ ẩm</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl font-bold text-green-600">{latestData.mq135}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">MQ135</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">
                  {latestData.light === 0 ? "Sáng" : "Tối"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Ánh sáng</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xl font-bold text-purple-600">
                  {latestData.sound === 1 ? "Ồn" : "Yên tĩnh"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Tiếng ồn</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-xl font-bold text-red-600">
                  {latestData.mq2 === 1 ? "⚠️ Phát hiện" : "An toàn"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Gas/Khói</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
