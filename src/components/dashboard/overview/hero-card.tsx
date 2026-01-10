'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/status-badge";
import type { CurrentSensorData, AlertSeverity } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import GaugeChart from "@/components/charts/gauge-chart";
import { Skeleton } from "@/components/ui/skeleton";

type HeroCardProps = {
  data: CurrentSensorData[];
};

const getOverallStatus = (data: CurrentSensorData[]): AlertSeverity => {
  if (data.some((d) => d.status === 'Nguy hiểm')) return 'Nguy hiểm';
  if (data.some((d) => d.status === 'Trung bình')) return 'Trung bình';
  return 'Tốt';
};

const statusDetails = {
  'Tốt': { message: "Môi trường làm việc đang ở trạng thái tốt nhất.", comfortScore: 95 },
  'Trung bình': { message: "Một vài chỉ số cần được chú ý để đảm bảo môi trường tối ưu.", comfortScore: 72 },
  'Nguy hiểm': { message: "Cảnh báo! Có chỉ số vượt ngưỡng an toàn, cần kiểm tra ngay.", comfortScore: 41 },
};

function HeroCard({ data }: HeroCardProps) {
  const overallStatus = getOverallStatus(data);
  const details = statusDetails[overallStatus];

  return (
    <Card className="lg:col-span-2 flex flex-col">
      <CardHeader>
        <CardTitle>Trạng thái phòng</CardTitle>
        <CardDescription>{details.message}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col md:flex-row items-center justify-around gap-6 text-center md:text-left">
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Trạng thái chung</p>
            <StatusBadge status={overallStatus} className="text-xl px-4 py-2" />
        </div>
        <div className="relative">
          <GaugeChart value={details.comfortScore} />
           <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{details.comfortScore}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Chỉ số thoải mái</p>
          <p className="text-2xl font-semibold">
            {overallStatus === 'Tốt' && 'Rất tốt'}
            {overallStatus === 'Trung bình' && 'Khá tốt'}
            {overallStatus === 'Nguy hiểm' && 'Cần cải thiện'}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full md:w-auto">
          <Link href="/thoi-gian-thuc">
            Xem thời gian thực <ArrowRight className="ml-2 h-4 w-4" />
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
