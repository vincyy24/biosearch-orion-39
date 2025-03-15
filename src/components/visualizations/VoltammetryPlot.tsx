import React, { useState, useEffect } from 'react';
import PlotlyVisualization from './PlotlyVisualization';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Download } from 'lucide-react';

// Sample voltammetry data
const generateSampleData = () => {
  const potentialStart = -0.5;
  const potentialEnd = 0.5;
  const numPoints = 100;
  const potentialStep = (potentialEnd - potentialStart) / numPoints;
  
  const potential = Array.from({ length: numPoints }, (_, i) => potentialStart + i * potentialStep);
  
  // Generate a voltammogram with two peaks
  const current = potential.map(p => {
    // Create a base current with some noise
    const baseCurrent = -5 + Math.random() * 0.5;
    
    // Add peaks
    const peak1 = p >= -0.2 && p <= 0.0 ? 15 * Math.exp(-Math.pow((p + 0.1) / 0.05, 2)) : 0;
    const peak2 = p >= 0.2 && p <= 0.4 ? -10 * Math.exp(-Math.pow((p - 0.3) / 0.05, 2)) : 0;
    
    return baseCurrent + peak1 + peak2;
  });
  
  return { potential, current };
};

// Different scan rates for demonstration
const scanRates = [50, 100, 200, 500];

interface VoltammetryPlotProps {
  height?: number | string;
  showControls?: boolean;
}

const VoltammetryPlot: React.FC<VoltammetryPlotProps> = ({ 
  height = 400, 
  showControls = true 
}) => {
  const [loading, setLoading] = useState(true);
  const [visibleScans, setVisibleScans] = useState<number[]>(scanRates);
  const [plotData, setPlotData] = useState<any[]>([]);
  const [normalizeY, setNormalizeY] = useState(false);
  const [displayMode, setDisplayMode] = useState<'voltage-current' | 'time-current' | 'time-voltage'>('voltage-current');
  
  useEffect(() => {
    setLoading(true);
    
    // Simulate API data loading
    setTimeout(() => {
      // Generate data for each scan rate
      const allData = scanRates.map(scanRate => {
        const { potential, current } = generateSampleData();
        
        // Calculate time values (in seconds) based on scan rate (mV/s)
        // Time = ΔE / scan rate
        const scanRateVoltsPerSecond = scanRate / 1000;
        const time = potential.map((p, i) => {
          if (i === 0) return 0;
          const deltaE = Math.abs(potential[i] - potential[i - 1]);
          return i * deltaE / scanRateVoltsPerSecond;
        });
        
        return { scanRate, potential, current, time };
      });
      
      updatePlotData(allData);
      setLoading(false);
    }, 1500);
  }, []);
  
  // Update plot data when visibility, normalization or display mode changes
  useEffect(() => {
    const allData = scanRates.map(scanRate => {
      const { potential, current } = generateSampleData();
      
      const scanRateVoltsPerSecond = scanRate / 1000;
      const time = potential.map((p, i) => i * 0.01 / scanRateVoltsPerSecond);
      
      return { scanRate, potential, current, time };
    });
    
    updatePlotData(allData);
  }, [visibleScans, normalizeY, displayMode]);
  
  const updatePlotData = (allData: Array<{
    scanRate: number;
    potential: number[];
    current: number[];
    time: number[];
  }>) => {
    // Filter by visible scan rates
    const filteredData = allData.filter(d => visibleScans.includes(d.scanRate));
    
    // Create plot traces
    const traces = filteredData.map(data => {
      // Normalize current if needed
      const normalizedCurrent = normalizeY 
        ? data.current.map((c: number) => c / Math.max(...data.current.map(Math.abs)))
        : data.current;
      
      let xData, yData, mode, name;
      
      switch (displayMode) {
        case 'time-current':
          xData = data.time;
          yData = normalizedCurrent;
          mode = 'lines';
          name = `${data.scanRate} mV/s`;
          break;
        case 'time-voltage':
          xData = data.time;
          yData = data.potential;
          mode = 'lines';
          name = `${data.scanRate} mV/s`;
          break;
        case 'voltage-current':
        default:
          xData = data.potential;
          yData = normalizedCurrent;
          mode = 'lines';
          name = `${data.scanRate} mV/s`;
          break;
      }
      
      return {
        x: xData,
        y: yData,
        type: 'scatter',
        mode,
        name,
        line: {
          width: 2
        }
      };
    });
    
    setPlotData(traces);
  };
  
  const getAxisLabels = () => {
    switch (displayMode) {
      case 'time-current':
        return {
          xaxis: { title: 'Time (s)' },
          yaxis: { title: normalizeY ? 'Normalized Current' : 'Current (μA)' }
        };
      case 'time-voltage':
        return {
          xaxis: { title: 'Time (s)' },
          yaxis: { title: 'Potential (V)' }
        };
      case 'voltage-current':
      default:
        return {
          xaxis: { title: 'Potential (V)' },
          yaxis: { title: normalizeY ? 'Normalized Current' : 'Current (μA)' }
        };
    }
  };
  
  const handleDownload = () => {
    // Simple CSV generation for demonstration
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers based on display mode
    if (displayMode === 'voltage-current') {
      csvContent += "Scan Rate (mV/s),Potential (V),Current (μA)\n";
    } else if (displayMode === 'time-current') {
      csvContent += "Scan Rate (mV/s),Time (s),Current (μA)\n";
    } else {
      csvContent += "Scan Rate (mV/s),Time (s),Potential (V)\n";
    }
    
    // Add data rows (just using the sample data for demonstration)
    scanRates.forEach(scanRate => {
      if (visibleScans.includes(scanRate)) {
        const { potential, current, time } = generateSampleData();
        
        const scanRateVoltsPerSecond = scanRate / 1000;
        const timeValues = potential.map((p, i) => i * 0.01 / scanRateVoltsPerSecond);
        
        potential.forEach((p, i) => {
          if (displayMode === 'voltage-current') {
            csvContent += `${scanRate},${p},${current[i]}\n`;
          } else if (displayMode === 'time-current') {
            csvContent += `${scanRate},${timeValues[i]},${current[i]}\n`;
          } else {
            csvContent += `${scanRate},${timeValues[i]},${p}\n`;
          }
        });
      }
    });
    
    // Create download link and trigger click
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "voltammetry_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const toggleScanRate = (scanRate: number) => {
    if (visibleScans.includes(scanRate)) {
      setVisibleScans(visibleScans.filter(sr => sr !== scanRate));
    } else {
      setVisibleScans([...visibleScans, scanRate]);
    }
  };
  
  return (
    <div className="space-y-4">
      {showControls && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium mb-2">Display Mode</p>
                <Select
                  value={displayMode}
                  onValueChange={(value: any) => setDisplayMode(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select display mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voltage-current">Voltage vs. Current</SelectItem>
                    <SelectItem value="time-current">Time vs. Current</SelectItem>
                    <SelectItem value="time-voltage">Time vs. Voltage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Normalize Y-Axis</p>
                <Toggle
                  pressed={normalizeY}
                  onPressedChange={setNormalizeY}
                >
                  {normalizeY ? 'On' : 'Off'}
                </Toggle>
              </div>
              
              <div className="ml-auto">
                <p className="text-sm font-medium mb-2">Actions</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload}
                  className="h-9"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Data
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Scan Rates</p>
              <div className="flex flex-wrap gap-2">
                {scanRates.map(scanRate => (
                  <Toggle
                    key={scanRate}
                    pressed={visibleScans.includes(scanRate)}
                    onPressedChange={() => toggleScanRate(scanRate)}
                    variant="outline"
                  >
                    {visibleScans.includes(scanRate) ? (
                      <Eye className="mr-1 h-3 w-3" />
                    ) : (
                      <EyeOff className="mr-1 h-3 w-3" />
                    )}
                    {scanRate} mV/s
                  </Toggle>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <PlotlyVisualization
        title="Cyclic Voltammetry"
        description="Interactive visualization of voltammetry data"
        data={plotData}
        layout={{
          ...getAxisLabels(),
          legend: { orientation: 'h', y: -0.2 }
        }}
        height={height}
        loading={loading}
      />
    </div>
  );
};

export default VoltammetryPlot;
