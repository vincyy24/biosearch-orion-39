
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, FileDown, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/services/api";

interface DataPoint {
  potential: number;
  current: number;
  time: number;
}

interface DataBrowserProps {
  experimentId?: string;
  fileId?: number;
  data?: DataPoint[];
  isLoading?: boolean;
}

const DataBrowser: React.FC<DataBrowserProps> = ({
  experimentId,
  fileId,
  data: initialData,
  isLoading: externalLoading = false
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("visualization");
  const [data, setData] = useState<DataPoint[]>(initialData || []);
  const [loading, setLoading] = useState(externalLoading);
  const [downloadFormat, setDownloadFormat] = useState("csv");
  const [customDelimiter, setCustomDelimiter] = useState(",");

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }

    if (experimentId) {
      fetchExperimentData();
    } else if (fileId) {
      fetchFileData();
    }
  }, [experimentId, fileId, initialData]);

  const fetchExperimentData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/experiments/${experimentId}/data/`);
      
      if (response.data && response.data.data_points) {
        setData(response.data.data_points);
      } else {
        // Fallback to sample data
        setData(getSampleData());
        toast({
          variant: "warning",
          title: "Using sample data",
          description: "Could not fetch actual data, showing sample visualization"
        });
      }
    } catch (error) {
      console.error("Error fetching experiment data:", error);
      setData(getSampleData());
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load experiment data. Using sample data instead."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFileData = async () => {
    try {
      setLoading(true);
      
      // This would be replaced with a real API call in a production app
      // const response = await apiClient.get(`/api/files/${fileId}/content/`);
      
      // For now, use sample data
      setData(getSampleData());
      
    } catch (error) {
      console.error("Error fetching file data:", error);
      setData(getSampleData());
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load file data. Using sample data instead."
      });
    } finally {
      setLoading(false);
    }
  };

  const getSampleData = (): DataPoint[] => {
    // Generate cyclic voltammetry-like data
    const sampleData: DataPoint[] = [];
    let current = 0;
    
    for (let i = 0; i < 100; i++) {
      const potential = (i / 10) - 5; // Range from -5 to 5
      
      // Simple sine wave to simulate CV curve
      current = 0.5 * Math.sin(potential * 1.5) + 0.2 * Math.sin(potential * 5);
      
      // Add noise
      current += (Math.random() - 0.5) * 0.1;
      
      sampleData.push({
        potential,
        current,
        time: i * 0.1
      });
    }
    
    return sampleData;
  };

  const handleDownload = () => {
    if (!fileId && !experimentId) {
      toast({
        variant: "destructive",
        title: "Cannot download",
        description: "No file or experiment ID provided"
      });
      return;
    }

    let url = '';
    if (fileId) {
      url = `/api/research/files/${fileId}/download/?format=${downloadFormat}`;
      if (downloadFormat === 'custom') {
        url += `&delimiter=${encodeURIComponent(customDelimiter)}`;
      }
    } else if (experimentId) {
      url = `/api/experiments/${experimentId}/download/?format=${downloadFormat}`;
      if (downloadFormat === 'custom') {
        url += `&delimiter=${encodeURIComponent(customDelimiter)}`;
      }
    }

    // Open download in a new tab
    window.open(url, '_blank');
  };

  const formatRawData = () => {
    if (!data || data.length === 0) return "No data available";
    
    let rawText = "potential,current,time\n";
    data.forEach(point => {
      rawText += `${point.potential},${point.current},${point.time}\n`;
    });
    
    return rawText;
  };

  const findMinMax = () => {
    if (!data || data.length === 0) return { minCurrent: 0, maxCurrent: 0, minPotential: 0, maxPotential: 0 };
    
    let minCurrent = data[0].current;
    let maxCurrent = data[0].current;
    let minPotential = data[0].potential;
    let maxPotential = data[0].potential;
    
    data.forEach(point => {
      minCurrent = Math.min(minCurrent, point.current);
      maxCurrent = Math.max(maxCurrent, point.current);
      minPotential = Math.min(minPotential, point.potential);
      maxPotential = Math.max(maxPotential, point.potential);
    });
    
    return { minCurrent, maxCurrent, minPotential, maxPotential };
  };

  const { minCurrent, maxCurrent, minPotential, maxPotential } = findMinMax();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Data Browser</CardTitle>
        <CardDescription>View and analyze experimental data</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 mb-4 flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2">
              <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="tsv">TSV</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              
              {downloadFormat === 'custom' && (
                <input
                  type="text"
                  value={customDelimiter}
                  onChange={(e) => setCustomDelimiter(e.target.value)}
                  className="w-12 px-2 py-1 border rounded"
                  maxLength={1}
                />
              )}
            </div>
            
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <FileDown className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="visualization" className="flex-1 flex flex-col mt-0">
              {data && data.length > 0 ? (
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={data}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="potential" 
                        type="number" 
                        label={{ value: 'Potential (V)', position: 'insideBottomRight', offset: -10 }}
                        domain={[minPotential, maxPotential]}
                        tickFormatter={(value) => value.toFixed(2)}
                      />
                      <YAxis 
                        dataKey="current" 
                        type="number"
                        label={{ value: 'Current (mA)', angle: -90, position: 'insideLeft' }}
                        domain={[minCurrent, maxCurrent]}
                        tickFormatter={(value) => value.toFixed(3)}
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(4), '']}
                        labelFormatter={(value) => `Potential: ${Number(value).toFixed(3)} V`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="current" 
                        stroke="#8884d8" 
                        name="Current (mA)"
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for visualization</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="raw" className="mt-0 flex-1">
              <div className="border rounded-md h-96 overflow-auto p-4 font-mono text-xs whitespace-pre">
                {formatRawData()}
              </div>
            </TabsContent>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DataBrowser;
