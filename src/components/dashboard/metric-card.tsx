'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatusBadge from "@/components/shared/status-badge";
import type { CurrentSensorData, Sensor } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Sparkline from "@/components/charts/sparkline";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  data: CurrentSensorData;
  config: Omit<Sensor, 'Icon'> & { iconName: keyof typeof Icons };
};

const statusGradients = {
  'Tốt': 'from-green-500/10 to-transparent',
  'Trung bình': 'from-yellow-500/10 to-transparent',
  'Nguy hiểm': 'from-red-500/10 to-transparent',
};

const statusIconColors = {
  'Tốt': 'text-green-500',
  'Trung bình': 'text-yellow-500',
  'Nguy hiểm': 'text-red-500',
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
    <Card className="group relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        statusGradients[data.status]
      )} />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-white">
          <div className={cn(
            "p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors",
          )}>
            <Icon className={cn("h-4 w-4 transition-colors", statusIconColors[data.status])} />
          </div>
          {config.name}
        </CardTitle>
        <StatusBadge status={data.status} />
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
                <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{data.value.toLocaleString('vi-VN')}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    Ngưỡng cao: <span className="font-medium">{config.thresholds.high}{config.unit}</span>
                </p>
            </div>
            <div className="w-24 h-12 opacity-80 group-hover:opacity-100 transition-opacity">
                <Sparkline data={history} status={data.status} />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton() {
    return (
        <Card className="animate-pulse border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-2/5 bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800" />
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <Skeleton className="w-24 h-12 bg-slate-200 dark:bg-slate-800" />
                </div>
            </CardContent>
        </Card>
    )
}

MetricCard.Skeleton = MetricCardSkeleton;


export default MetricCard;
