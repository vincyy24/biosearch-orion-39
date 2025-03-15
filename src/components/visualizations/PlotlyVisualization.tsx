import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Import Plotly types
import * as Plotly from 'plotly.js';

interface PlotlyVisualizationProps {
  title: string;
  description: string;
  data: any[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  height?: number | string;
  loading?: boolean;
}

const PlotlyVisualization = ({ 
  title, 
  description, 
  data, 
  layout = {}, 
  config = { responsive: true },
  height = '300px',
  loading: externalLoading
}: PlotlyVisualizationProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If external loading state is provided, use it
    if (externalLoading !== undefined) {
      setLoading(externalLoading);
      return;
    }

    // Otherwise, simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [externalLoading, data]);

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full flex items-center justify-center" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="w-full" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
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
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlotlyVisualization;
