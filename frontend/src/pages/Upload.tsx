
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDataTypes, fetchDataCategories, uploadFile } from "@/services/api";
import { fetchResearchProjects } from "@/services/researchService";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload as UploadIcon, FileUp, Lock, Globe } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { ResearchProject } from "@/types/common";

interface DataType {
  id: string;
  name: string;
}

interface DataCategory {
  id: string;
  name: string;
  description?: string;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dataType, setDataType] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [dataCategory, setDataCategory] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [electrode, setElectrode] = useState<string>("");
  const [instrument, setInstrument] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [dataCategories, setDataCategories] = useState<DataCategory[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Fetch data types, categories, and research projects on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesData, categoriesData] = await Promise.all([
          fetchDataTypes(),
          fetchDataCategories()
        ]);
        setDataTypes(typesData);
        setDataCategories(categoriesData);
        
        // Load research projects if user is authenticated
        if (isAuthenticated) {
          setIsLoadingProjects(true);
          try {
            const projectsData = await fetchResearchProjects();
            setProjects(projectsData.results || []);
          } catch (err) {
            console.error("Error loading research projects:", err);
          } finally {
            setIsLoadingProjects(false);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data types or categories. Please try again later.");
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    
    if (!dataType) {
      setError("Please select a data type");
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dataType", dataType);
      formData.append("description", description);
      formData.append("accessLevel", isPublic ? "public" : "private");
      
      if (dataCategory) {
        formData.append("category", dataCategory);
      }
      
      if (method) {
        formData.append("method", method);
      }
      
      if (electrode) {
        formData.append("electrodeType", electrode);
      }
      
      if (instrument) {
        formData.append("instrument", instrument);
      }
      
      if (projectId) {
        formData.append("researchProjectId", projectId);
      }
      
      // Get auth token (use empty string as fallback)
      const token = ""; // We're using session authentication so this is fine
      
      // Call the API
      const result = await uploadFile(formData, token);
      
      toast({
        title: "Upload successful",
        description: `${result.file_name} has been uploaded successfully.`,
      });
      
      // Redirect to the dataset view or dashboard
      navigate("/dashboard");
      
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred during upload.";
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container max-w-4xl py-10">
          <Alert variant="destructive">
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You must be logged in to upload files. Please log in and try again.
            </AlertDescription>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/login", { state: { from: { pathname: "/upload" } } })}
            >
              Go to Login
            </Button>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Dataset</CardTitle>
            <CardDescription>Share your potentiostat experiment data with the community or keep it private.</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select File</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="w-full h-24 flex flex-col items-center justify-center border-dashed"
                  >
                    <FileUp className="h-8 w-8 mb-2" />
                    <span>Click to select a file</span>
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {fileName && (
                  <p className="text-sm mt-2">Selected file: <span className="font-medium">{fileName}</span></p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="data-type">Data Type *</Label>
                  <Select value={dataType} onValueChange={setDataType} required>
                    <SelectTrigger id="data-type">
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data-category">Data Category</Label>
                  <Select value={dataCategory} onValueChange={setDataCategory}>
                    <SelectTrigger id="data-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="research-project">Research Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="research-project">
                    <SelectValue placeholder="Select research project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Personal Dataset)</SelectItem>
                    {isLoadingProjects ? (
                      <SelectItem value="loading" disabled>
                        Loading projects...
                      </SelectItem>
                    ) : projects.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-projects" disabled>
                        No research projects found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Assigning to a project will make this dataset available to all project collaborators.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a description of the dataset"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="access-level">Public Access</Label>
                    <p className="text-sm text-muted-foreground">
                      {isPublic ? 
                        "Everyone can access this dataset" : 
                        "Only you can access this dataset"}
                    </p>
                  </div>
                  <Switch
                    id="access-level"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
                <div className="p-3 rounded-md bg-muted flex items-center mt-2">
                  {isPublic ? (
                    <>
                      <Globe className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm">This dataset will be visible to all users</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="text-sm">This dataset will only be visible to you and your collaborators</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Experiment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="method">Method</Label>
                    <Input
                      id="method"
                      placeholder="e.g., Cyclic, Square wave"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="electrode">Electrode Type</Label>
                    <Input
                      id="electrode"
                      placeholder="e.g., Gold, Carbon"
                      value={electrode}
                      onChange={(e) => setElectrode(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instrument">Instrument</Label>
                    <Input
                      id="instrument"
                      placeholder="e.g., Potentiostat model"
                      value={instrument}
                      onChange={(e) => setInstrument(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !file || !dataType}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Dataset
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Upload;
