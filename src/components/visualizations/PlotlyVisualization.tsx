
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import Plotly types
import * as Plotly from 'plotly.js';

interface PlotlyVisualizationProps {
  title: string;
  description: string;
  data: any[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  className?: string;
  allowDownload?: boolean;
  isFullWidth?: boolean;
  height?: number;
}

const PlotlyVisualization = ({ 
  title, 
  description, 
  data, 
  layout = {}, 
  config = { responsive: true },
  className = "",
  allowDownload = true,
  isFullWidth = false,
  height = 300
}: PlotlyVisualizationProps) => {
  const [loading, setLoading] = useState(true);
  const [plotData, setPlotData] = useState(data);
  const { toast } = useToast();

  useEffect(() => {
    // Update plot data when data prop changes
    setPlotData(data);

    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [data]);

  const handleDownload = () => {
    try {
      // This is a placeholder - in a real app, you would use Plotly's toImage functionality
      // or connect to a backend download endpoint
      const plotElement = document.querySelector('.js-plotly-plot') as HTMLElement;
      if (plotElement) {
        Plotly.toImage(plotElement, {format: 'png', width: 800, height: 600})
          .then(function(dataUrl) {
            const link = document.createElement('a');
            link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-plot.png`;
            link.href = dataUrl;
            link.click();
          });
      }
      
      toast({
        title: "Download initiated",
        description: "Your visualization is being downloaded",
      });
    } catch (error) {
      console.error("Error downloading visualization:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the visualization. Please try again.",
        variant: "destructive",
      });
    }
  };

  const defaultLayout: Partial<Plotly.Layout> = {
    autosize: true,
    margin: { l: 50, r: 20, t: 20, b: 50 },
    hovermode: 'closest',
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      family: 'Inter, system-ui, sans-serif',
    },
    ...layout
  };

  const mergedConfig: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    ...config
  };

  return (
    <Card className={`overflow-hidden h-full ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {allowDownload && !loading && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full" style={{ height: `${height}px` }}>
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="w-full" style={{ height: `${height}px` }}>
            <Plot
              data={plotData}
              layout={defaultLayout}
              config={mergedConfig}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
              className="w-full h-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlotlyVisualization;
