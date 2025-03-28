
import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import MainLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, BarChart2, Book, Users, DownloadCloud, FileText, GitBranch, ExternalLink, Plus } from "lucide-react";
import PublicationDetailComponent from "@/components/publications/PublicationDetail";
import { verifyDOI, formatDOIMetadata } from "@/services/doiService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import PlotlyVisualization from "@/components/visualizations/PlotlyVisualization";
import VoltammetryPlot from "@/components/visualizations/VoltammetryPlot";
import { downloadData } from "@/services/api";

// Sample dataset for demonstration
const sampleDatasets = [
  {
    id: "ds1",
    name: "Cyclic Voltammetry - Sample 1",
    type: "voltammetry",
    experimentType: "cyclic",
    uploadDate: "2023-05-15",
    version: 2,
    size: "1.2 MB",
    downloads: 24
  },
  {
    id: "ds2",
    name: "Differential Pulse Analysis",
    type: "voltammetry",
    experimentType: "differential_pulse",
    uploadDate: "2023-06-02",
    version: 1,
    size: "845 KB",
    downloads: 12
  }
];

// Sample version history for demonstration
const sampleVersionHistory = [
  {
    version: 2,
    date: "2023-05-20",
    author: "Dr. Jane Smith",
    changes: "Updated metadata and corrected measurement units"
  },
  {
    version: 1,
    date: "2023-05-15",
    author: "Dr. Jane Smith",
    changes: "Initial upload of experimental data"
  }
];

// Sample analysis results for demonstration
const analysisResults = {
  peakData: [
    { x: 0.25, y: 120, label: "Oxidation Peak" },
    { x: 0.1, y: -80, label: "Reduction Peak" },
  ],
  statistics: {
    peakSeparation: "150 mV",
    peakRatio: "0.85",
    halfwavePotential: "0.175 V",
    diffusionCoefficient: "5.6 × 10^-6 cm²/s"
  }
};

const PublicationDetailPage = () => {
  const { doi } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [publication, setPublication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDataset, setActiveDataset] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("datasets");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchPublicationData = async () => {
      if (!doi) {
        setError("No DOI specified");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const doiMetadata = await verifyDOI(doi);
        
        if (!doiMetadata) {
          setError("Could not find publication with the specified DOI");
          setPublication(null);
        } else {
          const formattedMetadata = formatDOIMetadata(doiMetadata);
          setPublication(formattedMetadata);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching publication:", err);
        setError("An error occurred while fetching the publication data");
        setPublication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicationData();
  }, [doi]);

  // Check for dataset parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const datasetId = params.get("dataset");
    
    if (datasetId) {
      // Find the dataset in our sample data
      const foundInSamples = sampleDatasets.find(d => d.id === datasetId);
      
      if (foundInSamples) {
        setActiveDataset(datasetId);
        setActiveTab("datasets");
      }
    }
  }, [location.search]);

  const handleDownload = async (datasetId: string, format: 'csv' | 'excel' = 'csv') => {
    setIsDownloading(true);
    
    try {
      await downloadData(datasetId, format);
      
      toast({
        title: "Download successful",
        description: `The dataset has been downloaded as ${format === 'excel' ? 'Excel' : 'CSV'} file.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Download failed. Please try again.";
      
      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDatasetSelect = (datasetId: string) => {
    setActiveDataset(datasetId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/publications" className="inline-flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Publications
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading publication details...</span>
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please check the DOI and try again. If the problem persists, the publication may not be available.</p>
              <Button asChild className="mt-4">
                <Link to="/publications">Return to Publications</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{publication?.title}</CardTitle>
                    <CardDescription>
                      {publication?.journal}, {publication?.year}
                    </CardDescription>
                    <div className="flex mt-2 flex-wrap gap-2">
                      <Badge variant="outline">DOI: {publication?.doi}</Badge>
                      <Badge variant="secondary">{publication?.type}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={publication?.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" /> View Original
                      </a>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={`/upload?publicationDoi=${publication?.doi}`}>
                        <Plus className="h-4 w-4 mr-1" /> Add Dataset
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publication?.abstract && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Abstract</h3>
                      <p className="text-sm text-muted-foreground">{publication.abstract}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Authors</h3>
                    <div className="space-y-2">
                      {publication?.authors.map((author, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm mr-2">
                            {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{author.name}</p>
                            {author.isMain && (
                              <Badge variant="outline" className="text-xs">Main Author</Badge>
                            )}
                            {author.affiliation && (
                              <p className="text-xs text-muted-foreground">{author.affiliation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {publication?.subjects?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Subject Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {publication.subjects.map((subject, idx) => (
                          <Badge key={idx} variant="secondary">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="datasets" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="datasets">
                  <FileText className="h-4 w-4 mr-2" />
                  Datasets
                </TabsTrigger>
                <TabsTrigger value="analysis">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="versions">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Versions
                </TabsTrigger>
                <TabsTrigger value="researchers">
                  <Users className="h-4 w-4 mr-2" />
                  Researchers
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="datasets" className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Associated Datasets</CardTitle>
                    <CardDescription>
                      Experimental data related to this publication
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sampleDatasets.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sampleDatasets.map((dataset) => (
                            <TableRow key={dataset.id} className={activeDataset === dataset.id ? "bg-primary/5" : ""}>
                              <TableCell className="font-medium">{dataset.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {dataset.experimentType.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>v{dataset.version}</TableCell>
                              <TableCell>{dataset.uploadDate}</TableCell>
                              <TableCell>{dataset.size}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDatasetSelect(dataset.id)}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownload(dataset.id, 'csv')}
                                    disabled={isDownloading}
                                  >
                                    {isDownloading && activeDataset === dataset.id ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <DownloadCloud className="h-4 w-4 mr-1" />
                                    )}
                                    CSV
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownload(dataset.id, 'excel')}
                                    disabled={isDownloading}
                                  >
                                    {isDownloading && activeDataset === dataset.id ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <DownloadCloud className="h-4 w-4 mr-1" />
                                    )}
                                    Excel
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No datasets available for this publication yet</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link to={`/upload?publicationDoi=${publication?.doi}`}>
                            Upload dataset for this publication
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {activeDataset && (
                    <CardFooter className="flex flex-col items-start border-t p-6">
                      <h3 className="font-semibold mb-4">
                        Dataset Preview: {sampleDatasets.find(d => d.id === activeDataset)?.name}
                      </h3>
                      <div className="w-full h-80">
                        <VoltammetryPlot />
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="analysis" className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Analysis</CardTitle>
                    <CardDescription>
                      Analytical results from the experimental data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Analysis Results</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(analysisResults.statistics).map(([key, value]) => (
                            <Card key={key}>
                              <CardContent className="p-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </h4>
                                <p className="text-lg font-bold">{value}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Analysis Notes</h3>
                          <Card>
                            <CardContent className="p-4 text-sm">
                              <p>The analysis reveals a quasi-reversible electron transfer process with significant peak separation. 
                                The diffusion coefficient indicates moderate mass transport limitations.</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="h-80">
                        <PlotlyVisualization
                          title="Voltammetry Analysis"
                          description="Peak identification and analysis"
                          data={[
                            {
                              x: [-0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
                              y: [-20, -40, -60, -80, -40, 0, 40, 120, 60],
                              type: 'scatter',
                              mode: 'lines',
                              name: 'CV Data',
                              line: { color: 'blue' }
                            },
                            {
                              x: analysisResults.peakData.map(p => p.x),
                              y: analysisResults.peakData.map(p => p.y),
                              text: analysisResults.peakData.map(p => p.label),
                              type: 'scatter',
                              mode: 'markers+text',
                              marker: { 
                                size: 10, 
                                color: 'red' 
                              },
                              textposition: 'top',
                              name: 'Peak Data'
                            }
                          ]}
                          layout={{
                            xaxis: { title: 'Potential (V)' },
                            yaxis: { title: 'Current (µA)' },
                            margin: { t: 40 }
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-lg mb-4">Comparative Analysis</h3>
                      <div className="h-80">
                        <PlotlyVisualization
                          title="Data Comparison"
                          description="Comparative analysis of multiple datasets"
                          data={[
                            {
                              x: [-0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
                              y: [-20, -40, -60, -80, -40, 0, 40, 120, 60],
                              type: 'scatter',
                              mode: 'lines',
                              name: 'Sample 1',
                              line: { color: 'blue' }
                            },
                            {
                              x: [-0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
                              y: [-25, -45, -65, -90, -50, -5, 30, 110, 50],
                              type: 'scatter',
                              mode: 'lines',
                              name: 'Sample 2',
                              line: { color: 'red' }
                            },
                            {
                              x: [-0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
                              y: [-15, -35, -55, -75, -35, 5, 45, 130, 70],
                              type: 'scatter',
                              mode: 'lines',
                              name: 'Sample 3',
                              line: { color: 'green' }
                            }
                          ]}
                          layout={{
                            xaxis: { title: 'Potential (V)' },
                            yaxis: { title: 'Current (µA)' },
                            legend: { orientation: 'h', y: 1.1 },
                            margin: { t: 40 }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="versions" className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Version History</CardTitle>
                    <CardDescription>
                      Track changes to the research data over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted"></div>
                      <div className="space-y-6 relative">
                        {sampleVersionHistory.map((version, idx) => (
                          <div key={idx} className="relative pl-8">
                            <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm font-medium">v{version.version}</span>
                            </div>
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                  <h3 className="font-medium">Version {version.version}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {version.date}
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Modified by: {version.author}
                                </p>
                                <div className="text-sm p-2 bg-muted/30 rounded-md">
                                  <p>{version.changes}</p>
                                </div>
                                <div className="flex justify-end mt-3 gap-2">
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownload(`v${version.version}`, 'csv')}
                                  >
                                    <DownloadCloud className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="researchers" className="py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Researchers</CardTitle>
                    <CardDescription>
                      Researchers involved in this publication
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {publication?.authors.map((author, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 border rounded-md">
                          <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                              {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                          </div>
                          <div className="space-y-2 flex-grow">
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                              <h3 className="font-bold text-lg">{author.name}</h3>
                              {author.isMain && (
                                <Badge>Main Author</Badge>
                              )}
                            </div>
                            {author.affiliation && (
                              <p className="text-sm text-muted-foreground">
                                <Book className="inline-block h-4 w-4 mr-1" />
                                {author.affiliation}
                              </p>
                            )}
                            <p className="text-sm">
                              ORCID: <a href={`https://orcid.org/0000-0001-2345-6789`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">0000-0001-2345-6789</a>
                            </p>
                            <div className="mt-2">
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
                            </div>
                          </div>
                          <div className="flex-shrink-0 space-y-2">
                            <h4 className="font-medium text-sm">Research Stats</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-center p-2 bg-muted/30 rounded-md">
                                <p className="text-xs text-muted-foreground">Publications</p>
                                <p className="font-bold">{10 + idx}</p>
                              </div>
                              <div className="text-center p-2 bg-muted/30 rounded-md">
                                <p className="text-xs text-muted-foreground">Citations</p>
                                <p className="font-bold">{120 + (idx * 35)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PublicationDetailPage;
