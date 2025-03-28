
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload as UploadIcon, FileText, BookOpen, Beaker, Plus } from "lucide-react";
import PublicationRegistration from "@/components/publications/PublicationRegistration";
import { fetchResearchProjects } from "@/services/researchService";
import { searchPublicationsByDOI } from "@/services/doiService";

interface FileUploadState {
  file: File | null;
  fileName: string;
  description: string;
  dataType: string;
  isPublic: boolean;
  projectId: string | null;
  publicationDoi: string | null;
  experimentType: string;
}

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    fileName: "",
    description: "",
    dataType: "voltammetry",
    isPublic: false,
    projectId: null,
    publicationDoi: null,
    experimentType: "cyclic",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("project");
  const [showRegisterPublication, setShowRegisterPublication] = useState(false);

  // Fetch research projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchResearchProjects();
        setProjects(response.results || []);
      } catch (error) {
        console.error("Error loading research projects:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load research projects",
        });
      }
    };

    // Load sample publications for demo
    const loadPublications = async () => {
      try {
        // This would typically come from an API endpoint with user's publications
        const sampleDois = [
          "10.1021/jacs.0c01924",
          "10.1038/s41586-020-2649-2"
        ];
        const pubData = await searchPublicationsByDOI(sampleDois);
        setPublications(pubData || []);
      } catch (error) {
        console.error("Error loading publications:", error);
      }
    };

    loadProjects();
    loadPublications();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setUploadState((prev) => ({
        ...prev,
        file: selectedFile,
        fileName: selectedFile.name,
      }));
    }
  };

  const handleTogglePublic = (checked: boolean) => {
    setUploadState((prev) => ({
      ...prev,
      isPublic: checked,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUploadState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setUploadState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadState.file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload",
      });
      return;
    }

    if (activeTab === "project" && !uploadState.projectId) {
      toast({
        variant: "destructive",
        title: "No project selected",
        description: "Please select a research project or create a new one",
      });
      return;
    }

    if (activeTab === "publication" && !uploadState.publicationDoi) {
      toast({
        variant: "destructive",
        title: "No publication selected",
        description: "Please select a publication or register a new one",
      });
      return;
    }

    // Here we would typically submit to an API
    setIsUploading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Upload successful",
        description: `${uploadState.fileName} has been uploaded successfully.`,
      });
      
      // Redirect to the relevant page based on upload type
      if (activeTab === "project") {
        navigate(`/research/${uploadState.projectId}`);
      } else {
        navigate(`/publications/${uploadState.publicationDoi}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container py-8 mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload Research Data</h1>
        <p className="text-muted-foreground mb-8">
          Upload your experimental data to associate with a research project or publication
        </p>

        {showRegisterPublication ? (
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowRegisterPublication(false)}
              className="mb-4"
            >
              Back to Upload
            </Button>
            <PublicationRegistration />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Upload Dataset</CardTitle>
                <CardDescription>
                  Upload your research data and link it to a project or publication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload}>
                  <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="project">
                          <Beaker className="mr-2 h-4 w-4" />
                          Research Project
                        </TabsTrigger>
                        <TabsTrigger value="publication">
                          <FileText className="mr-2 h-4 w-4" />
                          Publication
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="project" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="projectId">Research Project</Label>
                          <Select 
                            onValueChange={(value) => handleSelectChange("projectId", value)}
                            value={uploadState.projectId || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a research project" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id.toString()}>
                                  {project.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="pt-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => navigate("/research")}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create New Research Project
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="publication" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="publicationDoi">Publication</Label>
                          <Select 
                            onValueChange={(value) => handleSelectChange("publicationDoi", value)}
                            value={uploadState.publicationDoi || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a publication" />
                            </SelectTrigger>
                            <SelectContent>
                              {publications.map((pub, index) => (
                                <SelectItem key={index} value={pub.doi}>
                                  {pub.title} ({pub.year})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="pt-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowRegisterPublication(true)}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Register New Publication
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="space-y-2">
                      <Label htmlFor="file">Upload File</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                          <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop your file here, or click to select
                          </p>
                          <Input
                            id="file"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => document.getElementById("file")?.click()}
                          >
                            Select File
                          </Button>
                        </div>
                        {uploadState.file && (
                          <div className="p-2 bg-muted/50 rounded flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="text-sm">{uploadState.file.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fileName">Dataset Name</Label>
                      <Input
                        id="fileName"
                        name="fileName"
                        placeholder="Enter dataset name"
                        value={uploadState.fileName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Enter a description of the dataset"
                        value={uploadState.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dataType">Data Type</Label>
                        <Select 
                          onValueChange={(value) => handleSelectChange("dataType", value)}
                          value={uploadState.dataType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select data type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="voltammetry">Voltammetry</SelectItem>
                            <SelectItem value="spectroscopy">Spectroscopy</SelectItem>
                            <SelectItem value="diffraction">Diffraction</SelectItem>
                            <SelectItem value="microscopy">Microscopy</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experimentType">Experiment Type</Label>
                        <Select 
                          onValueChange={(value) => handleSelectChange("experimentType", value)}
                          value={uploadState.experimentType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experiment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cyclic">Cyclic Voltammetry</SelectItem>
                            <SelectItem value="differential_pulse">Differential Pulse</SelectItem>
                            <SelectItem value="square_wave">Square Wave</SelectItem>
                            <SelectItem value="linear_sweep">Linear Sweep</SelectItem>
                            <SelectItem value="chronoamperometry">Chronoamperometry</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublic"
                        checked={uploadState.isPublic}
                        onCheckedChange={handleTogglePublic}
                      />
                      <Label htmlFor="isPublic">Make this dataset public</Label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isUploading || !uploadState.file}
                    >
                      {isUploading ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <UploadIcon className="mr-2 h-4 w-4" />
                          Upload Dataset
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Guidelines</CardTitle>
                <CardDescription>
                  Follow these guidelines for high-quality research data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-1">Supported File Formats</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>CSV files (.csv)</li>
                    <li>Excel files (.xlsx, .xls)</li>
                    <li>Text files (.txt)</li>
                    <li>JSON files (.json)</li>
                    <li>Instrument specific formats</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-1">Metadata Requirements</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Include detailed experiment conditions</li>
                    <li>Document instrument settings</li>
                    <li>Note any calibration information</li>
                    <li>Include units for all measurements</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-1">Best Practices</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Use consistent naming conventions</li>
                    <li>Include raw data whenever possible</li>
                    <li>Document any data transformations</li>
                    <li>Link to related publications</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate("/documentation")}>
                  View Full Documentation
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Upload;
