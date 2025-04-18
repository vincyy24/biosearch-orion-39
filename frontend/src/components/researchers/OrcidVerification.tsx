import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { initiateOrcidVerification, confirmOrcidVerification } from "@/services/researchService";
import { OrcidProfile } from "@/types/common";

interface OrcidVerificationProps {
  orcidId?: string;
  isVerified?: boolean;
  profileData?: OrcidProfile;
  onVerificationComplete?: () => void;
}

const OrcidVerification = ({
  orcidId = '',
  isVerified = false,
  profileData,
  onVerificationComplete
}: OrcidVerificationProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newOrcidId, setNewOrcidId] = useState(orcidId);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const handleInitiate = async () => {
    if (!newOrcidId) {
      toast({
        variant: "destructive",
        title: "ORCID ID is required",
        description: "Please enter your ORCID ID to continue."
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await initiateOrcidVerification(newOrcidId);
      setVerificationToken(response.verification_token);
      setShowVerificationForm(true);
      
      toast({
        title: "Verification initiated",
        description: "Please enter the verification code to complete the process."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Failed to initiate ORCID verification."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!verificationCode) {
      toast({
        variant: "destructive",
        title: "Verification code is required",
        description: "Please enter the verification code to continue."
      });
      return;
    }

    try {
      setIsLoading(true);
      await confirmOrcidVerification(verificationCode);
      
      toast({
        title: "ORCID verified",
        description: "Your ORCID ID has been successfully verified."
      });
      
      setShowVerificationForm(false);
      
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Failed to confirm ORCID verification."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          ORCID Verification
          {isVerified && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Verified
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Link your ORCID ID to verify your researcher identity
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isVerified ? (
          <>
            <div className="flex items-center space-x-2">
              <Label>ORCID ID:</Label>
              <span className="font-medium">{orcidId}</span>
              <a 
                href={`https://orcid.org/${orcidId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary text-sm underline"
              >
                View Profile
              </a>
            </div>
            
            {profileData && (
              <div className="mt-4 space-y-2">
                <p className="font-medium">{profileData.name}</p>
                {profileData.biography && (
                  <p className="text-sm text-muted-foreground">{profileData.biography}</p>
                )}
                
                {profileData.education && profileData.education.length > 0 && (
                  <div className="mt-2">
                    <Label>Education</Label>
                    <ul className="text-sm list-disc list-inside ml-2 mt-1">
                      {profileData.education.map((edu, index) => (
                        <li key={index}>{edu}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {profileData.works && profileData.works.length > 0 && (
                  <div className="mt-2">
                    <Label>Publications</Label>
                    <ul className="text-sm list-disc list-inside ml-2 mt-1">
                      {profileData.works.map((work, index) => (
                        <li key={index}>
                          <span className="font-medium">{work.title}</span> ({work.year})
                          {work.url && (
                            <a
                              href={work.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary ml-1 text-xs"
                            >
                              [Link]
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {!showVerificationForm ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    ORCID is a persistent digital identifier for researchers. Verifying your ORCID ID helps establish your identity as a researcher on our platform.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="orcid-id">Enter your ORCID ID</Label>
                  <Input
                    id="orcid-id"
                    value={newOrcidId}
                    onChange={(e) => setNewOrcidId(e.target.value)}
                    placeholder="0000-0000-0000-0000"
                    pattern="^\d{4}-\d{4}-\d{4}-\d{4}$"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: 0000-0000-0000-0000. Don't have an ORCID ID?{" "}
                    <a
                      href="https://orcid.org/register"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      Register here
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    To complete verification, please enter the code below.
                    <br />
                    <span className="font-medium mt-2 block">Verification Code: {verificationToken}</span>
                    <span className="text-xs text-muted-foreground">
                      (In a real implementation, this would be securely verified with ORCID's OAuth flow)
                    </span>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {!isVerified && (
          <>
            {showVerificationForm ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowVerificationForm(false)}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button onClick={handleConfirm} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Confirm Verification"
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleInitiate}
                disabled={isLoading || !newOrcidId}
                className="ml-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Verify ORCID ID"
                )}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrcidVerification;
