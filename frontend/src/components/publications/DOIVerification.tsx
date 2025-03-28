
import { useState } from "react";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { verifyDOI, formatDOIMetadata } from "@/services/doiService";
import { Badge } from "@/components/ui/badge";

interface DOIVerificationProps {
  onVerified: (metadata: any) => void;
}

const DOIVerification = ({ onVerified }: DOIVerificationProps) => {
  const [doi, setDoi] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (!doi.trim()) {
      setError("Please enter a DOI");
      return;
    }

    setIsVerifying(true);
    setError(null);
    
    try {
      const doiMetadata = await verifyDOI(doi);
      
      if (!doiMetadata) {
        setError("Could not verify DOI. Please check and try again.");
        setMetadata(null);
        setVerified(false);
      } else {
        const formattedMetadata = formatDOIMetadata(doiMetadata);
        setMetadata(formattedMetadata);
        setVerified(true);
        onVerified(formattedMetadata);
      }
    } catch (err) {
      setError("Error verifying DOI. Please try again later.");
      setMetadata(null);
      setVerified(false);
    } finally {
      setIsVerifying(false);
    }
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

      {verified && metadata && (
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
                      {metadata.authors.map((author, idx) => (
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
                      {metadata.subjects.map((subject, idx) => (
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
    </div>
  );
};

export default DOIVerification;
