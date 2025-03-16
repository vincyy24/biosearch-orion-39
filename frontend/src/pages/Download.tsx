
import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download as DownloadIcon, FileSpreadsheet, FileText, Check, AlertCircle, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const datasetOptions = [
  { label: "Complete Genomic Dataset", value: "genomic" },
  { label: "Protein Database", value: "protein" },
  { label: "Voltammetry Records", value: "voltammetry" },
  { label: "Publications Index", value: "publications" },
];

const Download = () => {
  const [selectedDataset, setSelectedDataset] = useState("genomic");
  const [downloadFormat, setDownloadFormat] = useState("csv");
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress(0);
    setDownloadComplete(false);
    setDownloadError(null);

    try {
      // Simulate download progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      // In a real implementation, this would be an API call to the Django backend
      // const response = await fetch(`/api/download/${selectedDataset}?format=${downloadFormat}`);
      // if (!response.ok) throw new Error('Download failed');
      
      // For demo purposes, we'll simulate a network request
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      clearInterval(interval);
      setProgress(100);
      setDownloadComplete(true);
      
      toast({
        title: "Download Complete",
        description: `Your ${getDatasetLabel(selectedDataset)} has been downloaded successfully.`,
      });
      
      // Simulate file download
      const fileName = `${selectedDataset}_data.${downloadFormat}`;
      const link = document.createElement("a");
      link.href = "#"; // In a real app, this would be the download URL
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setDownloadError("An error occurred during download. Please try again.");
      toast({
        title: "Download Failed",
        description: "There was an error downloading your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getDatasetLabel = (value: string) => {
    return datasetOptions.find(option => option.value === value)?.label || value;
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Download Research Data</h1>
        <p className="text-muted-foreground mb-8">
          Export complete datasets in your preferred format for offline analysis or integration with other tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Export Dataset</CardTitle>
                <CardDescription>
                  Select a dataset and format to download
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Dataset</label>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasetOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose Format</label>
                  <Tabs defaultValue="csv" value={downloadFormat} onValueChange={setDownloadFormat}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="csv">CSV</TabsTrigger>
                      <TabsTrigger value="excel">Excel</TabsTrigger>
                    </TabsList>
                    <TabsContent value="csv">
                      <div className="p-4 bg-muted/40 rounded-md mt-2">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">CSV Format</h4>
                            <p className="text-sm text-muted-foreground">
                              Comma-separated values format, suitable for most data analysis tools and spreadsheet applications.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="excel">
                      <div className="p-4 bg-muted/40 rounded-md mt-2">
                        <div className="flex items-start space-x-2">
                          <FileSpreadsheet className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">Excel Format</h4>
                            <p className="text-sm text-muted-foreground">
                              Native Microsoft Excel format with formatting preserved, best for direct use in Excel.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {downloadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{downloadError}</AlertDescription>
                  </Alert>
                )}

                {isDownloading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Downloading...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {downloadComplete && !isDownloading && (
                  <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>Your download has completed successfully!</AlertDescription>
                  </Alert>
                )}

                <Button 
                  className="w-full"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download Data"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Dataset Information</CardTitle>
                <CardDescription>
                  Details about the selected dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Dataset</h3>
                  <p className="text-sm text-muted-foreground">{getDatasetLabel(selectedDataset)}</p>
                </div>
                <div>
                  <h3 className="font-medium">Records</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDataset === "genomic" && "150,421 entries"}
                    {selectedDataset === "protein" && "84,752 entries"}
                    {selectedDataset === "voltammetry" && "12,385 entries"}
                    {selectedDataset === "publications" && "42,937 entries"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Last Updated</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Format</h3>
                  <p className="text-sm text-muted-foreground">
                    {downloadFormat.toUpperCase()} file
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">License</h3>
                  <p className="text-sm text-muted-foreground">
                    Research use only, see terms of service for details
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Usage Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <FileDown className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Downloaded data should be cited according to our citation guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileDown className="h-4 w-4 mt-0.5 text-primary" />
                    <span>For large datasets, expect longer download times</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileDown className="h-4 w-4 mt-0.5 text-primary" />
                    <span>Excel format is limited to datasets under 1 million rows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileDown className="h-4 w-4 mt-0.5 text-primary" />
                    <span>See documentation for API access to these datasets</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Download;
