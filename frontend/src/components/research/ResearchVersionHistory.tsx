import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Download, GitBranch, GitCommit, GitMerge } from "lucide-react";
import { format } from "date-fns";
import apiClient from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface ResearchVersion {
  id: string;
  version: number;
  changes: string;
  created_at: string;
  updated_at?: string;
  updated_by: {
    id: string;
    username: string;
  };
  is_current?: boolean;
}

interface ResearchVersionHistoryProps {
  projectId?: string;
  fileId?: number;
  isLoading?: boolean;
  versions?: ResearchVersion[];
  onViewVersion?: (version: number) => void;
  onDownloadVersion?: (version: number) => void;
}

const ResearchVersionHistory: React.FC<ResearchVersionHistoryProps> = ({ 
  projectId,
  fileId,
  isLoading: externalLoading = false,
  versions: externalVersions,
  onViewVersion,
  onDownloadVersion
}) => {
  const [versions, setVersions] = useState<ResearchVersion[]>(externalVersions || []);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // If external versions are provided, use those
    if (externalVersions && externalVersions.length > 0) {
      setVersions(externalVersions);
      setLoading(false);
      return;
    }

    // Only load if we have a projectId or fileId
    if (projectId) {
      fetchProjectVersions();
    } else if (fileId) {
      fetchFileVersions();
    }
  }, [projectId, fileId, externalVersions]);

  const fetchProjectVersions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`research/projects/${projectId}/versions/`);
      
      if (response.data && response.data.versions) {
        // Map API response to our component's expected format
        const mappedVersions = response.data.versions.map((version: any, index: number) => ({
          id: `v${version.version}`,
          version: parseFloat(version.version.replace('v', '')),
          changes: version.changes,
          created_at: version.updated_at, // API uses updated_at
          updated_by: version.updated_by,
          is_current: index === 0 // Assume latest is first
        }));
        
        setVersions(mappedVersions);
      } else {
        // Fallback to mock data if API doesn't return expected format
        setVersions(getMockVersions());
      }
    } catch (error) {
      console.error("Error fetching version history:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load version history. Using sample data instead.",
      });
      setVersions(getMockVersions());
    } finally {
      setLoading(false);
    }
  };

  const fetchFileVersions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`research/files/${fileId}/versions/`);
      
      if (response.data && response.data.versions) {
        // Map API response to our component's expected format
        const mappedVersions = response.data.versions.map((version: any, index: number) => ({
          id: version.id || `v${version.version}`,
          version: version.version,
          changes: version.changes || "Version update",
          created_at: version.uploaded_at || version.created_at,
          updated_by: version.uploaded_by || {
            id: "1",
            username: "Unknown User"
          },
          is_current: index === 0 // Assume latest is first
        }));
        
        setVersions(mappedVersions);
      } else {
        // Fallback to mock data if API doesn't return expected format
        setVersions(getMockVersions());
      }
    } catch (error) {
      console.error("Error fetching file versions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load file versions. Using sample data instead.",
      });
      setVersions(getMockVersions());
    } finally {
      setLoading(false);
    }
  };

  const getMockVersions = (): ResearchVersion[] => {
    return [
      {
        id: "v1",
        version: 1.0,
        changes: "Initial research project setup",
        created_at: "2023-04-15T10:30:00Z",
        updated_by: {
          id: "u1",
          username: "Dr. Jane Smith"
        },
        is_current: false
      },
      {
        id: "v2",
        version: 1.1,
        changes: "Updated methodology section",
        created_at: "2023-05-02T14:45:00Z",
        updated_by: {
          id: "u1",
          username: "Dr. Jane Smith"
        },
        is_current: false
      },
      {
        id: "v3",
        version: 1.2,
        changes: "Added preliminary results",
        created_at: "2023-06-10T09:15:00Z",
        updated_by: {
          id: "u2",
          username: "Dr. Michael Chen"
        },
        is_current: true
      }
    ];
  };

  const handleDownloadVersion = (version: number) => {
    if (onDownloadVersion) {
      onDownloadVersion(version);
    } else if (fileId) {
      // Default download functionality for files
      window.open(`/api/research/files/${fileId}/download/?format=csv&version=${version}`, '_blank');
    }
  };

  if (externalLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>Track changes to this research</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/6" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GitBranch className="mr-2 h-5 w-5" />
          Version History
        </CardTitle>
        <CardDescription>Track changes to this research</CardDescription>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <GitCommit className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No version history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div 
                key={version.id}
                className={`relative flex items-start gap-3 pt-4 pl-4 pb-3 pr-3 border rounded-md ${
                  version.is_current ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                {index < versions.length - 1 && (
                  <div className="absolute top-12 left-5 w-0.5 h-12 bg-muted-foreground/30" />
                )}
                
                <div className={`mt-1 p-1 rounded-full ${
                  version.is_current ? "bg-primary/20" : "bg-muted"
                }`}>
                  {version.is_current ? (
                    <GitMerge className="h-5 w-5 text-primary" />
                  ) : (
                    <GitCommit className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium">Version {version.version}</h4>
                        {version.is_current && (
                          <Badge variant="outline" className="ml-2 bg-primary/20 text-primary border-0">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        By {version.updated_by.username}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {format(new Date(version.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm">
                    {version.changes}
                  </p>
                  
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8" 
                      onClick={() => handleDownloadVersion(version.version)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </Button>
                    {onViewVersion && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 ml-2"
                        onClick={() => onViewVersion(version.version)}
                      >
                        <GitBranch className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchVersionHistory;
