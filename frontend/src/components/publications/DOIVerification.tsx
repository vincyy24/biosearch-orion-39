
import { useState } from "react";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { verifyDOI, formatDOIMetadata } from "@/services/doiService";

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
              The publication metadata has been retrieved from DOI.org
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Title:</span> {metadata.title}
                </div>
                <div>
                  <span className="font-semibold">Authors:</span> {metadata.authors}
                </div>
                <div>
                  <span className="font-semibold">Journal:</span> {metadata.journal}
                </div>
                <div>
                  <span className="font-semibold">Year:</span> {metadata.year}
                </div>
                <div>
                  <span className="font-semibold">Publisher:</span> {metadata.publisher}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs italic">
              The data being filled is from an external source, and ORION is not responsible for any faulty data. 
              Users should contact DOI or their publisher for the respective information.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
};

export default DOIVerification;
