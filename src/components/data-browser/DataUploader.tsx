
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataUploaderProps {
  isAuthenticated?: boolean;
}

const DataUploader = ({ isAuthenticated = false }: DataUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload data files.",
        variant: "destructive",
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!dataType) {
      toast({
        title: "Data type required",
        description: "Please select a data type for your upload.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate file upload
    try {
      // This would be replaced with an actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Upload successful",
        description: `File ${file.name} uploaded successfully as ${dataType}.`,
      });
      
      setFile(null);
      setDataType("");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Data Upload
        </CardTitle>
        <CardDescription>
          Upload your data files for analysis and visualization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAuthenticated ? (
          <div className="text-center p-4 border border-dashed rounded-md bg-muted/30">
            <p className="text-muted-foreground mb-2">You need to be logged in to upload data</p>
            <Button variant="outline" size="sm">
              Log In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/30 transition cursor-pointer">
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.json,.txt"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {file ? file.name : "Drag and drop or click to upload"}
                  </p>
                  {!file && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports CSV, Excel, JSON, and TXT files
                    </p>
                  )}
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data-type">Data Type</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger id="data-type">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gene">Gene</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="pathway">Pathway</SelectItem>
                  <SelectItem value="dataset">Dataset</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        )}
      </CardContent>
      {isAuthenticated && (
        <CardFooter className="flex justify-end">
          <Button type="submit" onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Data"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DataUploader;
