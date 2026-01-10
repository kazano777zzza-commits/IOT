'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/status-badge";
import type { CurrentSensorData, AlertSeverity } from "@/lib/types";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import GaugeChart from "@/components/charts/gauge-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type HeroCardProps = {
  data: CurrentSensorData[];
};

const getOverallStatus = (data: CurrentSensorData[]): AlertSeverity => {
  if (data.some((d) => d.status === 'Nguy hiểm')) return 'Nguy hiểm';
  if (data.some((d) => d.status === 'Trung bình')) return 'Trung bình';
  return 'Tốt';
};

const statusDetails = {
  'Tốt': { message: "Môi trường làm việc đang ở trạng thái tốt nhất.", comfortScore: 95, gradient: "from-green-500/20 via-transparent to-transparent" },
  'Trung bình': { message: "Một vài chỉ số cần được chú ý để đảm bảo môi trường tối ưu.", comfortScore: 72, gradient: "from-yellow-500/20 via-transparent to-transparent" },
  'Nguy hiểm': { message: "Cảnh báo! Có chỉ số vượt ngưỡng an toàn, cần kiểm tra ngay.", comfortScore: 41, gradient: "from-red-500/20 via-transparent to-transparent" },
};

const comfortLabels = {
  'Tốt': { text: 'Rất tốt', color: 'text-green-600 dark:text-green-400' },
  'Trung bình': { text: 'Khá tốt', color: 'text-yellow-600 dark:text-yellow-400' },
  'Nguy hiểm': { text: 'Cần cải thiện', color: 'text-red-600 dark:text-red-400' },
};

function HeroCard({ data }: HeroCardProps) {
  const overallStatus = getOverallStatus(data);
  const details = statusDetails[overallStatus];
  const comfortLabel = comfortLabels[overallStatus];

  return (
    <Card className="lg:col-span-2 flex flex-col relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-70",
        details.gradient
      )} />
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Trạng thái phòng</CardTitle>
        </div>
        <CardDescription>{details.message}</CardDescription>
      </CardHeader>
      <CardContent className="relative flex-grow flex flex-col md:flex-row items-center justify-around gap-6 text-center md:text-left">
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Trạng thái chung</p>
            <StatusBadge status={overallStatus} className="text-xl px-5 py-2.5 shadow-lg" />
        </div>
        <div className="relative group/gauge">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl opacity-0 group-hover/gauge:opacity-100 transition-opacity" />
          <GaugeChart value={details.comfortScore} />
           <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tight">{details.comfortScore}</span>
            <span className="text-sm text-muted-foreground font-medium">/100</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Chỉ số thoải mái</p>
          <p className={cn("text-2xl font-bold", comfortLabel.color)}>
            {comfortLabel.text}
          </p>
        </div>
      </CardContent>
      <CardFooter className="relative">
        <Button asChild className="w-full md:w-auto group/btn shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
          <Link href="/thoi-gian-thuc" className="flex items-center gap-2">
            Xem thời gian thực 
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function HeroCardSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardHeader>
      <CardContent className="flex items-center justify-around gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-48" />
      </CardFooter>
    </Card>
  );
}

HeroCard.Skeleton = HeroCardSkeleton;

export default HeroCard;
