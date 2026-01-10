'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/shared/status-badge";
import type { CurrentSensorData, GeneratedAlert, SmartAlert } from "@/lib/types";
import { generateAlertsAction } from "@/app/actions";
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AlertCircle, Bell } from 'lucide-react';

type RecentAlertsCardProps = {
  data: CurrentSensorData[];
};

function RecentAlertsCard({ data }: RecentAlertsCardProps) {
  const [alerts, setAlerts] = React.useState<GeneratedAlert[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const smartAlerts: SmartAlert[] = await generateAlertsAction(data);
        const newAlerts: GeneratedAlert[] = smartAlerts.map(alert => ({
          ...alert,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }));
        setAlerts(prevAlerts => {
          const allAlerts = [...newAlerts, ...prevAlerts];
          // Simple deduplication based on title and severity
          const uniqueAlerts = allAlerts.reduce((acc, current) => {
            if (!acc.find(item => item.title === current.title && item.severity === current.severity)) {
              acc.push(current);
            }
            return acc;
          }, [] as GeneratedAlert[]);
          return uniqueAlerts.slice(0, 10);
        });
      } catch (error) {
        console.error("Failed to fetch smart alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Check for new alerts every 30 seconds

    return () => clearInterval(interval);
  }, [data]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell />
          Cảnh báo gần đây
        </CardTitle>
        <CardDescription>
          Các cảnh báo thông minh do AI tạo ra dựa trên dữ liệu cảm biến.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {loading && alerts.length === 0 ? (
            <div className="space-y-4 pr-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4 pr-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    <StatusBadge status={alert.severity} iconOnly />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Chưa có cảnh báo nào.</p>
                <p className="text-sm text-muted-foreground/80">Mọi thứ đều đang ổn định.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

RecentAlertsCard.Skeleton = function RecentAlertsCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
    )
}

export default RecentAlertsCard;
