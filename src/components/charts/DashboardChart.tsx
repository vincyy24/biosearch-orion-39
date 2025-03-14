
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// Sample data for the dashboard chart
const data = [
  { name: "Jan", searches: 18, publications: 5, datasets: 12 },
  { name: "Feb", searches: 24, publications: 8, datasets: 10 },
  { name: "Mar", searches: 30, publications: 12, datasets: 15 },
  { name: "Apr", searches: 26, publications: 10, datasets: 18 },
  { name: "May", searches: 32, publications: 15, datasets: 22 },
  { name: "Jun", searches: 28, publications: 13, datasets: 20 },
  { name: "Jul", searches: 35, publications: 20, datasets: 25 },
  { name: "Aug", searches: 42, publications: 17, datasets: 30 },
];

// Chart configuration
const chartConfig = {
  searches: {
    label: "Searches",
    theme: {
      light: "#4f46e5",
      dark: "#818cf8",
    },
  },
  publications: {
    label: "Publications",
    theme: {
      light: "#16a34a",
      dark: "#4ade80",
    },
  },
  datasets: {
    label: "Datasets",
    theme: {
      light: "#ca8a04",
      dark: "#facc15",
    },
  },
};

const DashboardChart = () => {
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full h-full"
    >
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'var(--foreground)' }}
          tickLine={{ stroke: 'var(--foreground)' }}
          axisLine={{ stroke: 'var(--border)' }}
        />
        <YAxis 
          tick={{ fill: 'var(--foreground)' }}
          tickLine={{ stroke: 'var(--foreground)' }}
          axisLine={{ stroke: 'var(--border)' }}
        />
        <Tooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label) => `${label} 2023`}
            />
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="searches"
          stroke="var(--color-searches)"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="publications"
          stroke="var(--color-publications)"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="datasets"
          stroke="var(--color-datasets)"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default DashboardChart;
