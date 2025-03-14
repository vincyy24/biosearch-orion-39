
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
}

const PlotlyVisualization = ({ 
  title, 
  description, 
  data, 
  layout = {}, 
  config = { responsive: true } 
}: PlotlyVisualizationProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="w-full h-[300px]" />
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <Plot
              data={data}
              layout={{
                autosize: true,
                margin: { l: 50, r: 20, t: 20, b: 50 },
                ...layout
              }}
              config={config}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlotlyVisualization;
