import Plot from 'react-plotly.js';
import { Skeleton } from "@/components/ui/skeleton";

// Import Plotly types
import * as Plotly from 'plotly.js';

interface PlotlyChartProps {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    loading?: boolean;
    height?: number | string;
}

const PlotlyChart = ({
    data,
    layout = {},
    config = { responsive: true },
    loading = false,
    height = "100%"
}: PlotlyChartProps) => {
    if (loading) {
        return <Skeleton className="w-full h-full" />;
    }

    return (
        <div className="w-full h-full">
            <Plot
                data={data}
                layout={{
                    autosize: true,
                    margin: { l: 50, r: 20, t: 20, b: 50 },
                    hovermode: 'closest',
                    ...layout
                }}
                config={{
                    responsive: true,
                    displayModeBar: true,
                    ...config
                }}
                style={{ width: '100%', height }}
            />
        </div>
    );
};

export default PlotlyChart;