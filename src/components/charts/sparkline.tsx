import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AlertSeverity } from "@/lib/types";

type SparklineProps = {
  data: number[];
  status: AlertSeverity;
};

const chartColors: Record<AlertSeverity, { stroke: string; fill: string }> = {
  'Tốt': { stroke: "hsl(var(--chart-1))", fill: "hsl(var(--chart-1)/0.2)" },
  'Trung bình': { stroke: "hsl(var(--chart-3))", fill: "hsl(var(--chart-3)/0.2)" },
  'Nguy hiểm': { stroke: "hsl(var(--chart-5))", fill: "hsl(var(--chart-5)/0.2)" },
};

export default function Sparkline({ data, status }: SparklineProps) {
  const chartData = data.map((value, index) => ({ name: index, value }));
  const colors = chartColors[status];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`color-${status}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.fill} stopOpacity={0.8} />
            <stop offset="95%" stopColor={colors.fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={colors.stroke}
          fillOpacity={1}
          fill={`url(#color-${status})`}
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
