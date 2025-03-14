
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

// Sample data for the chart
const data = [
  { name: "Genes", count: 35000 },
  { name: "Proteins", count: 20000 },
  { name: "Pathways", count: 1500 },
  { name: "Variants", count: 42000 },
  { name: "Diseases", count: 8000 },
  { name: "Drugs", count: 12000 },
];

// Chart configuration
const chartConfig = {
  genes: {
    label: "Genes",
    theme: {
      light: "#4f46e5",
      dark: "#818cf8",
    },
  },
  proteins: {
    label: "Proteins",
    theme: {
      light: "#0891b2",
      dark: "#22d3ee",
    },
  },
  pathways: {
    label: "Pathways",
    theme: {
      light: "#16a34a",
      dark: "#4ade80",
    },
  },
  variants: {
    label: "Variants",
    theme: {
      light: "#ca8a04",
      dark: "#facc15",
    },
  },
  diseases: {
    label: "Diseases",
    theme: {
      light: "#be123c",
      dark: "#fb7185",
    },
  },
  drugs: {
    label: "Drugs",
    theme: {
      light: "#9333ea",
      dark: "#d8b4fe",
    },
  },
};

const SampleDataChart = () => {
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full aspect-[4/3] sm:aspect-[16/9]"
    >
      {/* Wrap the chart components in a single React Fragment to make it a single child */}
      <>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 40, bottom: 60 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--foreground)' }}
            tickLine={{ stroke: 'var(--foreground)' }}
            axisLine={{ stroke: 'var(--border)' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: 'var(--foreground)' }}
            tickLine={{ stroke: 'var(--foreground)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${value / 1000}k`;
              }
              return value;
            }}
          />
          <Bar
            dataKey="count"
            fill="var(--color-genes)"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label) => `${label} Data`}
                formatter={(value) => [
                  value.toLocaleString(),
                  "Count",
                ]}
              />
            }
          />
        </BarChart>
        <ChartLegend content={<ChartLegendContent />} />
      </>
    </ChartContainer>
  );
};

export default SampleDataChart;
