'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatusBadge from "@/components/shared/status-badge";
import type { CurrentSensorData, Sensor } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Sparkline from "@/components/charts/sparkline";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

type MetricCardProps = {
  data: CurrentSensorData;
  config: Omit<Sensor, 'Icon'> & { iconName: keyof typeof Icons };
};

function MetricCard({ data, config }: MetricCardProps) {
  const [history, setHistory] = useState<number[]>([]);

  const Icon = config.iconName in Icons ? Icons[config.iconName] as React.ElementType : Icons.HelpCircle;

  useEffect(() => {
    // Simulate historical data for sparkline
    const generateHistory = () => {
        const newHistory = Array.from({ length: 20 }, () => 
            data.value + (Math.random() - 0.5) * (data.value * 0.1)
        );
        newHistory[newHistory.length - 1] = data.value;
        setHistory(newHistory);
    };
    generateHistory();
  }, [data.value]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {config.name}
        </CardTitle>
        <StatusBadge status={data.status} />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
                <div className="text-4xl font-bold">{data.value.toLocaleString('vi-VN')}</div>
                <p className="text-xs text-muted-foreground">
                    Ngưỡng cao: {config.thresholds.high}{config.unit}
                </p>
            </div>
            <div className="w-24 h-12">
                <Sparkline data={history} status={data.status} />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

MetricCard.Skeleton = function MetricCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="w-24 h-12" />
                </div>
            </CardContent>
        </Card>
    )
}


export default MetricCard;
