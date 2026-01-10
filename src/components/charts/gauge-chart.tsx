import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";

type GaugeChartProps = {
  value: number; // 0-100
};

const MAX_VALUE = 100;
const STROKE_WIDTH = 10;
const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))"];

export default function GaugeChart({ value }: GaugeChartProps) {
  const data = [
    { name: "value", value: value },
    { name: "remainder", value: MAX_VALUE - value },
  ];

  return (
    <ResponsiveContainer width={120} height={120}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          dataKey="value"
          innerRadius={45 - STROKE_WIDTH}
          outerRadius={55 - STROKE_WIDTH}
          startAngle={90}
          endAngle={-270}
          paddingAngle={0}
          cornerRadius={STROKE_WIDTH}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
