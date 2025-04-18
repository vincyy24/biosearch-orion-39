import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Download as DownloadIcon, AlertCircle, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { downloadData, fetchVoltammetryData } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface DatasetOption {
  id: string;
  title: string;
  description: string;
  type: string;
}

const Download = () => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datasetType, setDatasetType] = useState("voltammetry");
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [fileFormat, setFileFormat] = useState<'csv' | 'excel'>('csv');
  const [datasets, setDatasets] = useState<DatasetOption[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch datasets based on the selected type
        if (datasetType === "voltammetry") {
          const voltammetryData = await fetchVoltammetryData();

          // Transform the data to match our interface
          const formattedData = Array.isArray(voltammetryData)
            ? voltammetryData.map((item: any) => ({
              id: item.experiment_id,
              title: item.title,
              description: `${item.experiment_type} voltammetry experiment`,
              type: 'voltammetry'
            }))
            : [];

          setDatasets(formattedData);

          // Set the first dataset as selected if available
          if (formattedData.length > 0 && !selectedDataset) {
            setSelectedDataset(formattedData[0].id);
          }
        } else {
          // Mock data for other dataset types
          const mockData = [
            {
              id: "sample-dataset-1",
              title: "Sample Dataset 1",
              description: "This is a sample dataset for demonstration purposes",
              type: datasetType
            },
            {
              id: "sample-dataset-2",
              title: "Sample Dataset 2",
              description: "Another sample dataset for demonstration purposes",
              type: datasetType
            }
          ];

          setDatasets(mockData);

          // Set the first dataset as selected if available
          if (mockData.length > 0 && !selectedDataset) {
            setSelectedDataset(mockData[0].id);
          }
        }
      } catch (err) {
        setError("Failed to fetch datasets. Please try again later.");
        console.error("Error fetching datasets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [datasetType]);

  const handleDownload = async () => {
    if (!selectedDataset) {
      setError("Please select a dataset to download");
      return;
    }

    setDownloading(true);
    setDownloadSuccess(false);
    setError(null);

    try {
      await downloadData(selectedDataset, fileFormat);
      setDownloadSuccess(true);

      toast({
        title: "Download successful",
        description: `The file has been downloaded as ${selectedDataset}.${fileFormat === 'excel' ? 'xlsx' : 'csv'}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Download failed. Please try again.";
      setError(errorMessage);

      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Download Data</h1>
        <p className="text-muted-foreground mb-6">
          Download research data in various formats for your analysis
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Datasets</CardTitle>
                <CardDescription>
                  Select a dataset and format to download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="voltammetry" value={datasetType} onValueChange={setDatasetType} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="voltammetry">Voltammetry</TabsTrigger>
                    <TabsTrigger value="genomics">Genomics</TabsTrigger>
                    <TabsTrigger value="clinical">Clinical</TabsTrigger>
                  </TabsList>

                  <TabsContent value="voltammetry" className="mt-0">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : datasets.length > 0 ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select Dataset</label>
                          <Select value={selectedDataset || ''} onValueChange={setSelectedDataset}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a dataset" />
                            </SelectTrigger>
                            <SelectContent>
                              {datasets.map((dataset) => (
                                <SelectItem key={dataset.id} value={dataset.id}>
                                  {dataset.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedDataset && (
                            <p className="text-sm text-muted-foreground">
                              {datasets.find(d => d.id === selectedDataset)?.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">File Format</label>
                          <div className="flex gap-2">
                            <Button
                              variant={fileFormat === 'csv' ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFileFormat('csv')}
                              className="flex-1"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              CSV
                            </Button>
                            <Button
                              variant={fileFormat === 'excel' ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFileFormat('excel')}
                              className="flex-1"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Excel
                            </Button>
                          </div>
                        </div>

                        <Button
                          onClick={handleDownload}
                          disabled={downloading || !selectedDataset}
                          className="w-full"
                        >
                          {downloading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <DownloadIcon className="h-4 w-4 mr-2" />
                              Download
                            </>
                          )}
                        </Button>

                        {error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        {downloadSuccess && (
                          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>
                              Your file has been downloaded successfully.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No datasets available</AlertTitle>
                        <AlertDescription>
                          There are currently no voltammetry datasets available for download.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="genomics" className="mt-0">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Coming Soon</AlertTitle>
                      <AlertDescription>
                        Genomics datasets will be available for download in the near future.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="clinical" className="mt-0">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Coming Soon</AlertTitle>
                      <AlertDescription>
                        Clinical datasets will be available for download in the near future.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Download Information</CardTitle>
                <CardDescription>Data usage guidelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Data Citation</h3>
                  <p className="text-sm text-muted-foreground">
                    When using downloaded data in publications, please cite the original source:
                  </p>
                  <p className="text-sm mt-2 border p-2 rounded">
                    BiomediResearch Database (2023). Dataset ID: {selectedDataset || 'dataset_id'}. Retrieved on {new Date().toISOString().split('T')[0]}.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Data License</h3>
                  <p className="text-sm text-muted-foreground">
                    All datasets are provided under the Creative Commons Attribution 4.0 International License (CC BY 4.0).
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Data Format Description</h3>
                  <p className="text-sm text-muted-foreground">
                    CSV files are comma-separated value files that can be opened in spreadsheet software.
                    Excel files are in the XLSX format compatible with Microsoft Excel and other spreadsheet programs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Download;
