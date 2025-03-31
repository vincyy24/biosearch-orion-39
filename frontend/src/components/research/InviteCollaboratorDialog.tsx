
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, User, Mail, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/services/api";

interface InviteCollaboratorDialogProps {
  projectId: string;
  projectTitle?: string;
  onSuccess?: (data: any) => void;
  trigger?: React.ReactNode;
}

const InviteCollaboratorDialog = ({
  projectId,
  projectTitle = "this project",
  onSuccess,
  trigger
}: InviteCollaboratorDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [email, setEmail] = useState("");
  const [orcidId, setOrcidId] = useState("");
  const [role, setRole] = useState("viewer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvite = async () => {
    // Validate inputs
    if (activeTab === "email" && !email) {
      toast({
        variant: "destructive",
        title: "Missing email",
        description: "Please enter an email address"
      });
      return;
    }

    if (activeTab === "orcid" && !orcidId) {
      toast({
        variant: "destructive",
        title: "Missing ORCID ID",
        description: "Please enter an ORCID ID"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        role,
        ...(activeTab === "email" ? { email } : { orcid_id: orcidId })
      };

      const response = await apiClient.post(`/api/research/projects/${projectId}/invite/`, payload);

      toast({
        title: "Invitation sent",
        description: response.data.message || "Collaborator invitation has been sent"
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset form and close dialog
      setEmail("");
      setOrcidId("");
      setRole("viewer");
      setOpen(false);

    } catch (error: any) {
      console.error("Error inviting collaborator:", error);
      toast({
        variant: "destructive",
        title: "Invitation failed",
        description: error.response?.data?.error || "There was an error sending the invitation"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Invite Collaborator
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a Collaborator</DialogTitle>
          <DialogDescription>
            Invite a researcher to collaborate on {projectTitle}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="orcid">
              <BookOpen className="mr-2 h-4 w-4" />
              ORCID ID
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@example.com"
              />
              <p className="text-xs text-muted-foreground">
                An invitation will be sent to this email address
              </p>
            </div>
          </TabsContent>

          <TabsContent value="orcid" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="orcid">ORCID ID</Label>
              <Input
                id="orcid"
                value={orcidId}
                onChange={(e) => setOrcidId(e.target.value)}
                placeholder="0000-0000-0000-0000"
                pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}"
              />
              <p className="text-xs text-muted-foreground">
                Enter a valid ORCID ID (format: 0000-0000-0000-0000)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 mt-2">
          <Label htmlFor="role">Collaborator role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <User className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer (can only view content)</SelectItem>
              <SelectItem value="contributor">Contributor (can add content)</SelectItem>
              <SelectItem value="manager">Manager (can manage project and collaborators)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleInvite}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCollaboratorDialog;
