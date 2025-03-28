import { useState } from "react";
import { AlertCircle, Loader2, CheckCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verifyDOI, formatDOIMetadata } from "@/services/doiService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiResponse } from "@/types/apiResponse";
import axios from "axios";

interface DOIVerificationProps {
  onVerified: (metadata: any) => void;
  onDOIAlreadyExists?: (doi: string, metadata: any) => void;
}

const DOIVerification = ({ onVerified, onDOIAlreadyExists }: DOIVerificationProps) => {
  const [doi, setDoi] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingPublication, setExistingPublication] = useState<any>(null);
  const [showExistingDialog, setShowExistingDialog] = useState(false);

  const checkExistingPublication = async (doi: string) => {
    try {
      const response = await axios.get(`/api/publications/${doi}/`);
      if (response.status === 200) {
        setExistingPublication(response.data);
        setShowExistingDialog(true);
        if (onDOIAlreadyExists) {
          onDOIAlreadyExists(doi, response.data);
        }
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  };

  const handleVerify = async () => {
    if (!doi.trim()) {
      setError("Please enter a DOI");
      return;
    }

    setIsVerifying(true);
    setError(null);
    
    try {
      const exists = await checkExistingPublication(doi);
      if (exists) {
        setIsVerifying(false);
        return;
      }
      
      const doiResponse = await verifyDOI(doi);
      
      if (!doiResponse) {
        setError("Could not verify DOI. Please check and try again.");
        setMetadata(null);
        setVerified(false);
      } else {
        const formattedMetadata = formatDOIMetadata(doiResponse);
        setMetadata(formattedMetadata);
        setVerified(true);
        setShowConfirmDialog(true);
      }
    } catch (err) {
      setError("Error verifying DOI. Please try again later.");
      setMetadata(null);
      setVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmMetadata = () => {
    setShowConfirmDialog(false);
    onVerified(metadata);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="doi" className="font-medium">
          Publication DOI
        </label>
        <div className="flex gap-2">
          <Input
            id="doi"
            placeholder="e.g. 10.1021/jacs.0c01924"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleVerify} 
            disabled={isVerifying || !doi.trim()}
          >
            {isVerifying ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying</>
            ) : (
              "Verify DOI"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {verified && metadata && !showConfirmDialog && (
        <>
          <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700 dark:text-green-300">DOI Verified Successfully</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              The publication metadata has been retrieved from Crossref
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Title:</span> {metadata.title}
                </div>
                <div>
                  <span className="font-semibold">Main Author:</span> {metadata.mainAuthor}
                </div>
                {metadata.authors.length > 1 && (
                  <div>
                    <span className="font-semibold">All Authors:</span>
                    <div className="ml-4 mt-1 space-y-1">
                      {metadata.authors.map((author: any, idx: number) => (
                        <div key={idx} className="flex items-center">
                          {author.name}
                          {author.isMain && (
                            <Badge variant="outline" className="ml-2 text-xs">Main</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Journal:</span> {metadata.journal}
                </div>
                <div>
                  <span className="font-semibold">Year:</span> {metadata.year}
                </div>
                <div>
                  <span className="font-semibold">Publisher:</span> {metadata.publisher}
                </div>
                {metadata.abstract && (
                  <div>
                    <span className="font-semibold">Abstract:</span>
                    <p className="mt-1 text-sm text-muted-foreground">{metadata.abstract}</p>
                  </div>
                )}
                {metadata.subjects && metadata.subjects.length > 0 && (
                  <div>
                    <span className="font-semibold">Subjects:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {metadata.subjects.map((subject: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs italic">
              The data being filled is from Crossref, and ORION is not responsible for any faulty data. 
              Users should contact DOI or their publisher for corrections.
            </AlertDescription>
          </Alert>
        </>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Publication Metadata</DialogTitle>
            <DialogDescription>
              The following metadata was retrieved from Crossref. Please confirm if you want to use this information.
            </DialogDescription>
          </DialogHeader>
          
          {metadata && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Publication Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Title:</span> {metadata.title}
                    </div>
                    <div>
                      <span className="font-medium">DOI:</span> {metadata.doi}
                    </div>
                    <div>
                      <span className="font-medium">Journal:</span> {metadata.journal}
                    </div>
                    <div>
                      <span className="font-medium">Year:</span> {metadata.year}
                    </div>
                    <div>
                      <span className="font-medium">Publisher:</span> {metadata.publisher}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {metadata.type || "Not specified"}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Authors</h3>
                  <div className="space-y-1">
                    {metadata.authors.map((author: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span>{author.name}</span>
                        {author.isMain && (
                          <Badge variant="outline" className="text-xs">Main</Badge>
                        )}
                        {author.affiliation && (
                          <span className="text-xs text-muted-foreground">({author.affiliation})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {metadata.abstract && (
                <div>
                  <h3 className="font-semibold mb-2">Abstract</h3>
                  <p className="text-sm text-muted-foreground">{metadata.abstract}</p>
                </div>
              )}
              
              {metadata.subjects && metadata.subjects.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Keywords/Subjects</h3>
                  <div className="flex flex-wrap gap-1">
                    {metadata.subjects.map((subject: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{subject}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {(metadata.funders && metadata.funders.length > 0) && (
                <div>
                  <h3 className="font-semibold mb-2">Funders</h3>
                  <div className="space-y-1">
                    {metadata.funders.map((funder: any, idx: number) => (
                      <div key={idx}>
                        <span>{funder.name}</span>
                        {funder.award && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Award: {Array.isArray(funder.award) ? funder.award.join(", ") : funder.award})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {metadata.references && (
                <div>
                  <h3 className="font-semibold mb-2">References</h3>
                  <p className="text-sm">This publication contains {metadata.referenceCount} references.</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmMetadata}>
              Use This Metadata
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExistingDialog} onOpenChange={setShowExistingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publication Already Exists</DialogTitle>
            <DialogDescription>
              A publication with this DOI has already been registered in our system.
            </DialogDescription>
          </DialogHeader>
          
          {existingPublication && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold">{existingPublication.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Published in {existingPublication.journal}, {existingPublication.year}
                </p>
              </div>
              
              {existingPublication.researchers && existingPublication.researchers.length > 0 && (
                <div>
                  <h4 className="font-medium">Registered by:</h4>
                  <p className="text-sm">
                    {existingPublication.researchers.find((r: any) => r.is_primary)?.name || 
                      existingPublication.researchers[0]?.name || "Unknown researcher"}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowExistingDialog(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowExistingDialog(false);
                if (existingPublication) {
                  window.location.href = `/publications/${existingPublication.doi}`;
                }
              }}
            >
              View Publication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DOIVerification;
