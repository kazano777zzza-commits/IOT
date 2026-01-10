import PageHeader from "@/components/shared/page-header";
import HeroCard from "@/components/dashboard/overview/hero-card";
import RecentAlertsCard from "@/components/dashboard/overview/recent-alerts-card";
import MetricCard from "@/components/dashboard/metric-card";
import { generateInitialData, getSensorConfig } from "@/lib/data";
import type { CurrentSensorData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export const revalidate = 0; // Force dynamic rendering

export default function TongQuanPage() {
  const initialData = generateInitialData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan"
        description="Trạng thái tổng thể môi trường phòng làm việc."
      />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <Suspense fallback={<HeroCard.Skeleton />}>
          <HeroCard data={initialData} />
        </Suspense>
        
        <Suspense fallback={<RecentAlertsCard.Skeleton />}>
          <RecentAlertsCard data={initialData} />
        </Suspense>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {initialData.map((data) => {
          const config = getSensorConfig(data.metric);
          if (!config) return null;
          return (
            <Suspense key={config.id} fallback={<MetricCard.Skeleton />}>
              <MetricCard data={data} config={config} />
            </Suspense>
          );
        })}
      </div>
    </div>
  );
}
