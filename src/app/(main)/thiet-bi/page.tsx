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
}

export default function ThietBiPage() {
  const [status, setStatus] = useState<DeviceStatus>({
    online: false,
    lastSeen: null,
    responseTime: null,
    totalRequests: 0,
    errorCount: 0,
  });
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("http://192.168.4.1/data", {
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        setStatus((prev) => ({
          ...prev,
          online: true,
          lastSeen: new Date(),
          responseTime,
          totalRequests: prev.totalRequests + 1,
        }));
      } else {
        throw new Error("Response not OK");
      }
    } catch (error) {
      console.error("Connection check failed:", error);
      setStatus((prev) => ({
        ...prev,
        online: false,
        responseTime: null,
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
              bar <= bars ? "bg-green-500" : "bg-muted"
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <div className="mt-2">{getStatusBadge()}</div>
              </div>
              {status.online ? (
                <Activity className="h-8 w-8 text-green-500 animate-pulse" />
              ) : (
                <WifiOff className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Thời gian phản hồi</p>
                <p className="text-2xl font-bold">
                  {status.responseTime ? `${status.responseTime}ms` : "N/A"}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cường độ tín hiệu</p>
                <p className="text-2xl font-bold">{signalStrength}%</p>
              </div>
              <div className="flex items-center gap-2">
                {getSignalBars()}
                <Signal className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lần kiểm tra cuối</p>
                <p className="text-sm font-medium">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Thông tin thiết bị</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnection}
              disabled={checking}
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
                <p className="text-sm font-medium text-muted-foreground">Địa chỉ IP</p>
                <p className="text-lg font-mono">192.168.4.1</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">WiFi SSID</p>
                <p className="text-lg">IoT-Demo</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Loại thiết bị</p>
                <p className="text-lg">ESP8266 NodeMCU</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng số yêu cầu</p>
                <p className="text-2xl font-bold">{status.totalRequests}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Số lỗi</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{status.errorCount}</p>
                  {status.errorCount > 10 && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ thành công</p>
                <p className="text-lg font-bold">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chất lượng kết nối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Độ trễ</span>
                  <span className="font-medium">
                    {status.responseTime
                      ? status.responseTime < 200
                        ? "Tốt"
                        : status.responseTime < 500
                        ? "Trung bình"
                        : "Chậm"
                      : "N/A"}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
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
                  <span>Độ ổn định</span>
                  <span className="font-medium">
                    {status.totalRequests > 0
                      ? status.errorCount / status.totalRequests < 0.1
                        ? "Ổn định"
                        : "Không ổn định"
                      : "N/A"}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hướng dẫn kết nối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p>Kết nối WiFi vào mạng <strong>"IoT-Demo"</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p>Mật khẩu: <strong>12345678</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p>
                  ESP8266 có địa chỉ IP: <code className="bg-muted px-1 py-0.5 rounded">192.168.4.1</code>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <p>Dashboard sẽ tự động kết nối và hiển thị dữ liệu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
