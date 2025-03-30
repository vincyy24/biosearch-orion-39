import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layouts/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  FileText, 
  BarChart2, 
  ExternalLink, 
  Upload, 
  FileDown,
  Eye,
  Calendar,
  User, 
  Building,
  Mail,
  Microscope,
  GitBranch
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import PublicationDetail from "@/components/publications/PublicationDetail";
import ResearchVersionHistory from "@/components/research/ResearchVersionHistory";

interface Dataset {
  id: string;
  title: string;
  description: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  is_public: boolean;
}

const PublicationDetailPage = () => {
  const [searchParams] = useSearchParams();
  const doi = searchParams.get("doi");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [publication, setPublication] = useState<any>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "details");
  
  useEffect(() => {
    fetchPublicationDetails();
  }, [doi]);

  const fetchPublicationDetails = async () => {
    if (!doi) return;
    
    try {
      setLoading(true);

      const response = await axios.get(`/api/publications/${doi.replace("/", "_")}/`);
      
      setPublication(response.data);
      
      if (response.data.datasets) {
        setDatasets(response.data.datasets);
      }
    } catch (error) {
      console.error("Error fetching publication details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load publication details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDataset = async (datasetId: string) => {
    try {
      // In a real app this would call an API endpoint to download the file
      const response = await axios.get(`/api/datasets/${datasetId}/download/`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dataset-${datasetId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Download Started",
        description: "Your dataset download has started.",
      });
    } catch (error) {
      console.error("Error downloading dataset:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error downloading this dataset.",
      });
    }
  };

  const handleViewVersion = (version: number) => {
    // Navigate to a specific version of the publication
    toast({
      title: "Viewing Version",
      description: `Viewing publication version ${version}`,
    });
  };

  const handleDownloadVersion = (version: number) => {
    // Download a specific version of the publication
    toast({
      title: "Download Started",
      description: `Downloading publication version ${version}`,
    });
  };

  const mockVersionHistory = [
    {
      id: "101",
      version: 3,
      created_at: "2023-09-15",
      created_by: {id: "js", name: "Dr. Jane Smith"},
      changes: "Updated metadata and added new experiment results",
      is_current: true,
    },
    {
      id: "102",
      version: 2,
      created_at: "2023-08-22",
      created_by: {id: "jd", name: "Dr. John Doe"},
      changes: "Added supplementary data and corrected typos",
      is_current: false,
    },
    {
      id: "103",
      version: 1,
      created_at: "2023-07-10",
      created_by: {id: "js", name: "Dr. Jane Smith"},
      changes: "Initial publication registration",
      is_current: false,
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 max-w-7xl">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-96" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Tabs defaultValue="details">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="datasets">Datasets</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-60" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    );
  }

  if (!publication) {
    return (
      <MainLayout>
        <div className="container py-8 max-w-7xl">
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Publication Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The publication with DOI "{doi}" was not found.
            </p>
            <Button onClick={() => navigate("/publications")}>
              Back to Publications
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{publication.title}</h1>
              {publication.is_public ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                  Private
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {publication.journal}, {publication.year} • DOI: {publication.doi}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => window.open(`https://doi.org/${publication.doi}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Original
            </Button>
            <Button onClick={() => navigate(`/upload?publication=${publication.doi}`)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details" className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="datasets" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Datasets
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center">
              <BarChart2 className="w-4 h-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center">
              <GitBranch className="w-4 h-4 mr-2" />
              Versions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PublicationDetail publication={{
                  title: publication.title,
                  journal: publication.journal,
                  year: publication.year,
                  authors: publication.researchers.map((r: any) => ({
                    name: r.name,
                    isMain: r.is_primary,
                    affiliation: r.institution
                  })),
                  doi: publication.doi,
                  abstract: publication.abstract,
                  publisher: publication.publisher,
                  url: publication.url || `https://doi.org/${publication.doi}`,
                  type: "Journal Article",
                  subjects: [],
                  datasets: datasets,
                  referenceCount: 0
                }} />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Researchers</CardTitle>
                    <CardDescription>
                      Contributors to this publication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {publication.researchers.map((researcher: any) => (
                      <div key={researcher.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1.5 text-muted-foreground" />
                              <span className="font-medium">{researcher.name}</span>
                              {researcher.is_primary && (
                                <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                              )}
                            </div>
                            
                            {researcher.institution && (
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Building className="h-3.5 w-3.5 mr-1.5" />
                                {researcher.institution}
                              </div>
                            )}
                            
                            {researcher.email && (
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 mr-1.5" />
                                {researcher.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Related Research</CardTitle>
                    <CardDescription>
                      Research projects associated with this publication
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <Microscope className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No related research projects yet
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/research/new")}>
                        Create Research Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="datasets">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Datasets</CardTitle>
                      <CardDescription>
                        Datasets associated with this publication
                      </CardDescription>
                    </div>
                    <Button onClick={() => navigate(`/upload?publication=${publication.doi}`)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {datasets.length > 0 ? (
                    <div className="space-y-4">
                      {datasets.map((dataset: Dataset) => (
                        <Card key={dataset.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <h3 className="font-medium">{dataset.title}</h3>
                                  {dataset.is_public ? (
                                    <Badge className="ml-2" variant="outline">Public</Badge>
                                  ) : (
                                    <Badge className="ml-2" variant="outline">Private</Badge>
                                  )}
                                </div>
                                
                                {dataset.description && (
                                  <p className="text-sm text-muted-foreground">{dataset.description}</p>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    {dataset.file_type || "Unknown type"}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    {new Date(dataset.created_at).toLocaleDateString()}
                                  </div>
                                  <div>
                                    {formatFileSize(dataset.file_size)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownloadDataset(dataset.id)}
                                >
                                  <FileDown className="h-4 w-4 mr-1.5" />
                                  Download
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                >
                                  <Eye className="h-4 w-4 mr-1.5" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Datasets Available</h3>
                      <p className="text-muted-foreground mb-4">
                        There are no datasets associated with this publication yet.
                      </p>
                      <Button onClick={() => navigate(`/upload?publication=${publication.doi}`)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Dataset
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Analysis & Visualizations</CardTitle>
                  <CardDescription>
                    Analyze and visualize the data from this publication
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Analyses Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload datasets and create analysis visualizations to see them here.
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button 
                        onClick={() => navigate(`/upload?publication=${publication.doi}`)}
                        variant="outline"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Data
                      </Button>
                      <Button>
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Create Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Track changes to this publication over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResearchVersionHistory
                  versions={mockVersionHistory}
                  onViewVersion={handleViewVersion}
                  onDownloadVersion={handleDownloadVersion}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) return "Unknown size";
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export default PublicationDetailPage;
