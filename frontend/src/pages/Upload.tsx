
import { useState, useEffect, useRef } from "react";
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
import { AlertCircle, Upload as UploadIcon, FileText, BookOpen, Beaker, Plus, Info, Trash2, Loader2 } from "lucide-react";
import PublicationRegistration from "@/components/publications/PublicationRegistration";
import { fetchResearchProjects } from "@/services/researchService";
import { searchPublicationsByDOI } from "@/services/doiService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

interface FileInfo {
  id: string;
  file: File | null;
  fileName: string;
  description: string;
  dataType: string;
  experimentType: string;
}

interface UploadState {
  isPublic: boolean;
  projectId: string | null;
  publicationDoi: string | null;
  files: FileInfo[];
}

interface Project {
  id: string;
  title: string;
  is_public: boolean;
}

interface Publication {
  doi: string;
  title: string;
  year: string;
  is_public: boolean;
}

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadState, setUploadState] = useState<UploadState>({
    isPublic: false,
    projectId: null,
    publicationDoi: null,
    files: [{
      id: crypto.randomUUID(),
      file: null,
      fileName: "",
      description: "",
      dataType: "voltammetry",
      experimentType: "cyclic",
    }],
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [activeTab, setActiveTab] = useState("project");
  const [showRegisterPublication, setShowRegisterPublication] = useState(false);
  const [selectedItemIsPublic, setSelectedItemIsPublic] = useState<boolean | null>(null);

  // Fetch research projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchResearchProjects();
        const projectsWithVisibility = response.results.map((project: any) => ({
          ...project,
          is_public: Boolean(project.is_public)
        }));
        setProjects(projectsWithVisibility || []);
      } catch (error) {
        console.error("Error loading research projects:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load research projects",
        });
      }
    };

    const loadPublications = async () => {
      try {
        // This would typically come from an API endpoint with user's publications
        const sampleDois = [
          "10.1021/jacs.0c01924",
          "10.1038/s41586-020-2649-2"
        ];
        const pubData = await searchPublicationsByDOI(sampleDois);
        // Add is_public property
        const publicationsWithVisibility = pubData.map((pub: any) => ({
          ...pub,
          is_public: Boolean(pub.is_public)
        }));
        setPublications(publicationsWithVisibility || []);
      } catch (error) {
        console.error("Error loading publications:", error);
      }
    };

    loadProjects();
    loadPublications();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileId: string) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    // If multiple files are selected, add them all
    if (selectedFiles.length > 1) {
      const newFiles: FileInfo[] = Array.from(selectedFiles).map(file => ({
        id: crypto.randomUUID(),
        file,
        fileName: file.name,
        description: "",
        dataType: "voltammetry",
        experimentType: "cyclic",
      }));
      
      // Replace the current empty file with the new files
      const otherFiles = uploadState.files.filter(f => f.id !== fileId || f.file !== null);
      setUploadState(prev => ({
        ...prev,
        files: [...otherFiles, ...newFiles],
      }));
    } else {
      // Just update the single file
      const file = selectedFiles[0];
      setUploadState(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === fileId 
            ? { ...f, file, fileName: file.name } 
            : f
        ),
      }));
    }
  };

  const handleAddFile = () => {
    setUploadState(prev => ({
      ...prev,
      files: [
        ...prev.files,
        {
          id: crypto.randomUUID(),
          file: null,
          fileName: "",
          description: "",
          dataType: "voltammetry",
          experimentType: "cyclic",
        }
      ],
    }));
  };

  const handleRemoveFile = (id: string) => {
    if (uploadState.files.length <= 1) {
      // Don't remove the last file, just clear it
      setUploadState(prev => ({
        ...prev,
        files: [{
          id: crypto.randomUUID(),
          file: null,
          fileName: "",
          description: "",
          dataType: "voltammetry",
          experimentType: "cyclic",
        }],
      }));
      return;
    }
    
    setUploadState(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== id),
    }));
  };

  const handleTogglePublic = (checked: boolean) => {
    setUploadState(prev => ({
      ...prev,
      isPublic: checked,
    }));
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fileId: string,
    field: keyof FileInfo
  ) => {
    const { value } = e.target;
    setUploadState(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === fileId 
          ? { ...f, [field]: value } 
          : f
      ),
    }));
  };

  const handleFileSelectChange = (
    fileId: string,
    field: keyof FileInfo,
    value: string
  ) => {
    setUploadState(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === fileId 
          ? { ...f, [field]: value } 
          : f
      ),
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // Handle project or publication selection and update visibility state
    if (name === "projectId") {
      const selectedProject = projects.find(p => p.id.toString() === value);
      setSelectedItemIsPublic(selectedProject?.is_public || false);
      
      // If project is private, make dataset private as well
      if (selectedProject && !selectedProject.is_public) {
        setUploadState(prev => ({
          ...prev,
          [name]: value,
          isPublic: false
        }));
      } else {
        setUploadState(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (name === "publicationDoi") {
      const selectedPublication = publications.find(p => p.doi === value);
      setSelectedItemIsPublic(selectedPublication?.is_public || false);
      
      // If publication is private, make dataset private as well
      if (selectedPublication && !selectedPublication.is_public) {
        setUploadState(prev => ({
          ...prev,
          [name]: value,
          isPublic: false
        }));
      } else {
        setUploadState(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setUploadState(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if no project or publication is selected
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
    
    // Check if any files are missing
    const missingFiles = uploadState.files.filter(f => !f.file);
    if (missingFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "Missing files",
        description: `Please select ${missingFiles.length > 1 ? 'files' : 'a file'} for all uploads`,
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = uploadState.files.map(async (fileInfo) => {
        const formData = new FormData();
        formData.append('file', fileInfo.file as File);
        formData.append('title', fileInfo.fileName);
        formData.append('description', fileInfo.description);
        formData.append('file_type', fileInfo.dataType);
        formData.append('experiment_type', fileInfo.experimentType);
        formData.append('is_public', uploadState.isPublic.toString());
        
        let url = '';
        if (activeTab === "project" && uploadState.projectId) {
          url = `/api/research/${uploadState.projectId}/upload/`;
        } else if (activeTab === "publication" && uploadState.publicationDoi) {
          url = `/api/publications/${uploadState.publicationDoi}/upload/`;
        }
        
        return axios.post(url, formData);
      });
      
      await Promise.all(uploadPromises);
      
      toast({
        title: "Upload successful",
        description: `${uploadState.files.length} ${uploadState.files.length > 1 ? 'datasets have' : 'dataset has'} been uploaded successfully.`,
      });
      
      // Redirect to the relevant page based on upload type
      if (activeTab === "project") {
        navigate(`/research/${uploadState.projectId}`);
      } else {
        navigate(`/publications/${uploadState.publicationDoi}`);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.response?.data?.error || "There was an error uploading your files.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isInputDisabled = (activeTab === "project" && !uploadState.projectId) || 
                          (activeTab === "publication" && !uploadState.publicationDoi);

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
            <PublicationRegistration onComplete={() => {
              setShowRegisterPublication(false);
              toast({
                title: "Publication registered",
                description: "Your publication has been registered successfully.",
              });
            }} />
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
                                  {project.title} {!project.is_public && "(Private)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="pt-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => navigate("/research/new")}
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
                                  {pub.title} ({pub.year}) {!pub.is_public && "(Private)"}
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

                    {isInputDisabled && (
                      <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-700 dark:text-amber-400">
                          Please select a {activeTab === "project" ? "research project" : "publication"} first
                          to enable dataset upload.
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedItemIsPublic === false && (
                      <Alert variant="warning" className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <AlertDescription className="text-amber-600 dark:text-amber-400">
                          The selected {activeTab === "project" ? "project" : "publication"} is private. 
                          Datasets for private {activeTab === "project" ? "projects" : "publications"} must also be private.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Dataset Files</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddFile}
                          disabled={isInputDisabled}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add File
                        </Button>
                      </div>
                    </div>

                    {uploadState.files.map((fileInfo, index) => (
                      <div key={fileInfo.id} className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Dataset {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(fileInfo.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`file-${fileInfo.id}`}>Upload File</Label>
                            <div className="grid grid-cols-1 gap-2">
                              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                                <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  Drag and drop your file here, or click to select
                                </p>
                                <Input
                                  id={`file-${fileInfo.id}`}
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, fileInfo.id)}
                                  disabled={isInputDisabled}
                                  ref={fileInputRef}
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => document.getElementById(`file-${fileInfo.id}`)?.click()}
                                  disabled={isInputDisabled}
                                >
                                  Select File
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                  You can select multiple files at once
                                </p>
                              </div>
                              {fileInfo.file && (
                                <div className="p-2 bg-muted/50 rounded flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{fileInfo.file.name}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`fileName-${fileInfo.id}`}>Dataset Name</Label>
                            <Input
                              id={`fileName-${fileInfo.id}`}
                              value={fileInfo.fileName}
                              onChange={(e) => handleFileInputChange(e, fileInfo.id, 'fileName')}
                              placeholder="Enter dataset name"
                              disabled={isInputDisabled}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`description-${fileInfo.id}`}>Description</Label>
                            <Textarea
                              id={`description-${fileInfo.id}`}
                              value={fileInfo.description}
                              onChange={(e) => handleFileInputChange(e, fileInfo.id, 'description')}
                              placeholder="Enter a description of the dataset"
                              rows={3}
                              disabled={isInputDisabled}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`dataType-${fileInfo.id}`}>Data Type</Label>
                              <Select 
                                value={fileInfo.dataType}
                                onValueChange={(value) => handleFileSelectChange(fileInfo.id, 'dataType', value)}
                                disabled={isInputDisabled}
                              >
                                <SelectTrigger id={`dataType-${fileInfo.id}`}>
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
                              <Label htmlFor={`experimentType-${fileInfo.id}`}>Experiment Type</Label>
                              <Select 
                                value={fileInfo.experimentType}
                                onValueChange={(value) => handleFileSelectChange(fileInfo.id, 'experimentType', value)}
                                disabled={isInputDisabled}
                              >
                                <SelectTrigger id={`experimentType-${fileInfo.id}`}>
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
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 justify-between rounded-lg border p-4">
                        <div>
                          <Label htmlFor="isPublic" className="text-base">Make these datasets public</Label>
                          <p className="text-sm text-muted-foreground">
                            Public datasets are visible to anyone browsing the platform
                          </p>
                        </div>
                        <Switch
                          id="isPublic"
                          checked={uploadState.isPublic}
                          onCheckedChange={handleTogglePublic}
                          disabled={selectedItemIsPublic === false || isInputDisabled}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={
                        isUploading || 
                        isInputDisabled || 
                        uploadState.files.some(f => !f.file)
                      }
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="mr-2 h-4 w-4" />
                          Upload Datasets
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
