import { useState, useRef } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, X, Check, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const DATA_TYPES = [
  { id: "voltammetry", name: "Voltammetry Data" },
  { id: "protein", name: "Protein Sequence" },
  { id: "genome", name: "Genomic Data" },
  { id: "other", name: "Other" },
];

const Upload = () => {
  const [dataType, setDataType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!dataType) {
      setError("Please select a data type");
      return;
    }

    setError("");
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 300);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });
      
      setTimeout(() => {
        setFile(null);
        setDataType("");
        setDescription("");
        setUploadSuccess(false);
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setError("An error occurred during upload. Please try again.");
      setUploading(false);
      
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Upload Data</h1>
              <p className="text-muted-foreground">
                Upload your research data to the platform
              </p>
            </div>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Upload Research Data</CardTitle>
              <CardDescription>
                Supported file formats: CSV, JSON, TXT, XLSX (max 50MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {uploadSuccess && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Your file has been uploaded successfully.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="dataType">Data Type</Label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger id="dataType" disabled={uploading}>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter a description for your data"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading}
                />
              </div>
              
              <div className="space-y-2">
                <Label>File Upload</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted"
                  } ${file ? "bg-muted/10" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!file ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <UploadCloud className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Drag and drop your file here, or{" "}
                          <span
                            className="text-primary cursor-pointer hover:underline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            browse
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum file size: 50MB
                        </p>
                      </div>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {uploading ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center space-x-2">
                            <File className="h-6 w-6 text-muted-foreground" />
                            <span className="text-sm font-medium truncate max-w-xs">
                              {file.name}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {uploadProgress}% uploaded...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <File className="h-6 w-6 text-muted-foreground" />
                            <span className="text-sm font-medium truncate max-w-xs">
                              {file.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="mr-2"
                  disabled={uploading}
                  onClick={() => {
                    setFile(null);
                    setDataType("");
                    setDescription("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Upload;
