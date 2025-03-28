
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadCloud, GitCommit } from "lucide-react";

interface VersionDetails {
  version: number;
  date: string;
  author: string;
  changes: string;
  isCurrent: boolean;
}

interface ResearchVersionHistoryProps {
  // projectId: string;
  versions: VersionDetails[];
  onViewVersion: (version: number) => void;
  onDownloadVersion: (version: number) => void;
}

const ResearchVersionHistory: React.FC<ResearchVersionHistoryProps> = ({
  versions,
  onViewVersion,
  onDownloadVersion
}) => {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted"></div>
      <div className="space-y-6 relative">
        {versions ? versions.map((version, idx) => (
          <div key={idx} className="relative pl-8">
            <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <GitCommit className="h-4 w-4 text-muted-foreground" />
            </div>
            <Card className={version.isCurrent ? "border-primary" : ""}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Version {version.version}</h3>
                    {version.isCurrent && (
                      <Badge variant="outline">Current</Badge>
                    )}
                  </div>
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewVersion(version.version)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDownloadVersion(version.version)}
                  >
                    <DownloadCloud className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )):
        <div className="text-center text-muted-foreground">
          <span>No versions available.</span>
        </div>}
      </div>
    </div>
  );
};

export default ResearchVersionHistory;
