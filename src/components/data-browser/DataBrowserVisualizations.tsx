
import React from "react";
import PlotlyVisualization from "@/components/visualizations/PlotlyVisualization";

// Sample PlotlyJs data generators
const generateBarChartData = () => [
  {
    x: ['Genes', 'Proteins', 'Pathways', 'Datasets'],
    y: [3, 2, 2, 1],
    type: 'bar',
    marker: {
      color: ['rgba(64, 76, 237, 0.8)', 'rgba(237, 64, 85, 0.8)', 'rgba(64, 237, 188, 0.8)', 'rgba(237, 194, 64, 0.8)']
    }
  }
];

const generateScatterPlotData = () => [
  {
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    mode: 'markers',
    type: 'scatter',
    marker: { 
      size: 12,
      color: 'rgba(64, 76, 237, 0.8)',
    },
    name: 'Series A'
  },
  {
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    mode: 'markers',
    type: 'scatter',
    marker: { 
      size: 12,
      color: 'rgba(237, 64, 85, 0.8)',
    },
    name: 'Series B'
  }
];

const generateVoltammetryData = () => [
  {
    x: Array.from({ length: 100 }, (_, i) => i / 10),
    y: Array.from({ length: 100 }, (_, i) => Math.sin(i / 10) * Math.exp(-i / 50) * 10),
    type: 'scatter',
    mode: 'lines',
    name: 'Voltage',
    line: { color: 'rgba(64, 76, 237, 0.8)', width: 2 }
  }
];

const DataBrowserVisualizations = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PlotlyVisualization 
          title="Data Distribution"
          description="Distribution of data types in the database"
          data={generateBarChartData()}
          layout={{
            title: "",
            xaxis: { title: "Data Type" },
            yaxis: { title: "Count" }
          }}
        />
        
        <PlotlyVisualization
          title="Data Relationships"
          description="Correlation between related data points"
          data={generateScatterPlotData()}
          layout={{
            title: "",
            xaxis: { title: "Variable X" },
            yaxis: { title: "Variable Y" }
          }}
        />
      </div>
      
      <div className="mb-6">
        <PlotlyVisualization
          title="Voltammetry Analysis"
          description="Time series data visualization of voltage measurements"
          data={generateVoltammetryData()}
          layout={{
            title: "",
            xaxis: { title: "Time (s)" },
            yaxis: { title: "Voltage (mV)" }
          }}
          height={400}
          isFullWidth={true}
        />
      </div>
      
      <div className="bg-muted/30 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Genome Browser Integration</h3>
        <p className="text-muted-foreground mb-4">
          The genome browser visualization will be integrated here, 
          allowing researchers to explore genomic regions interactively.
        </p>
        <div className="border border-dashed border-muted-foreground/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Genome Browser Placeholder (IGV.js Integration)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataBrowserVisualizations;
