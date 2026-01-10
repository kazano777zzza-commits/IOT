'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/shared/status-badge";
import type { CurrentSensorData, GeneratedAlert, SmartAlert } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AlertCircle, Bell, CheckCircle2 } from 'lucide-react';

type RecentAlertsCardProps = {
  data: CurrentSensorData[];
};

// Generate alerts based on sensor data without AI
function generateLocalAlerts(data: CurrentSensorData[]): GeneratedAlert[] {
  const alerts: GeneratedAlert[] = [];
  
  data.forEach(sensor => {
    if (sensor.status === 'Nguy hiểm') {
      alerts.push({
        id: crypto.randomUUID(),
        title: `${sensor.metric === 'temperature' ? 'Nhiệt độ' : 
                 sensor.metric === 'humidity' ? 'Độ ẩm' :
                 sensor.metric === 'light' ? 'Ánh sáng' :
                 sensor.metric === 'noise' ? 'Tiếng ồn' :
                 sensor.metric === 'airQuality' ? 'Chất lượng không khí' :
                 'Khí gas/khói'} vượt ngưỡng`,
        message: `Giá trị hiện tại: ${sensor.value}. Cần kiểm tra ngay.`,
        severity: 'Nguy hiểm',
        timestamp: new Date(),
      });
    } else if (sensor.status === 'Trung bình') {
      alerts.push({
        id: crypto.randomUUID(),
        title: `${sensor.metric === 'temperature' ? 'Nhiệt độ' : 
                 sensor.metric === 'humidity' ? 'Độ ẩm' :
                 sensor.metric === 'light' ? 'Ánh sáng' :
                 sensor.metric === 'noise' ? 'Tiếng ồn' :
                 sensor.metric === 'airQuality' ? 'Chất lượng không khí' :
                 'Khí gas/khói'} cần chú ý`,
        message: `Giá trị hiện tại: ${sensor.value}. Nên theo dõi thêm.`,
        severity: 'Trung bình',
        timestamp: new Date(),
      });
    }
  });
  
  return alerts;
}

function RecentAlertsCard({ data }: RecentAlertsCardProps) {
  const [alerts, setAlerts] = React.useState<GeneratedAlert[]>([]);

  React.useEffect(() => {
    const localAlerts = generateLocalAlerts(data);
    setAlerts(localAlerts);
  }, [data]);

  return (
    <Card className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          Cảnh báo gần đây
        </CardTitle>
        <CardDescription>
          Cảnh báo tự động dựa trên ngưỡng cảm biến.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {alerts.length > 0 ? (
            <div className="space-y-3 pr-4">
              {alerts.map((alert, index) => (
                <div 
                  key={alert.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mt-0.5">
                    <StatusBadge status={alert.severity} iconOnly />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{alert.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{alert.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1.5">
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="p-4 rounded-full bg-green-500/10 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-medium text-foreground">Chưa có cảnh báo nào.</p>
                <p className="text-sm text-muted-foreground mt-1">Mọi thứ đều đang ổn định.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function RecentAlertsCardSkeleton() {
    return (
        <Card className="animate-pulse">
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
            </CardContent>
        </Card>
    )
}

RecentAlertsCard.Skeleton = RecentAlertsCardSkeleton;

export default RecentAlertsCard;
