
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UserPlus } from "lucide-react";

interface InviteCollaboratorDialogProps {
  projectId: string;
  onInviteSuccess: () => void;
}

const InviteCollaboratorDialog: React.FC<InviteCollaboratorDialogProps> = ({
  projectId,
  onInviteSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [email, setEmail] = useState("");
  const [orcidId, setOrcidId] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/research/projects/${projectId}/invite/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: activeTab === "email" ? email : undefined,
          orcid_id: activeTab === "orcid" ? orcidId : undefined,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite collaborator");
      }

      toast({
        title: "Invitation sent",
        description: data.message || "Collaborator has been invited successfully.",
      });

      setOpen(false);
      onInviteSuccess();
      resetForm();
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to invite collaborator. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setOrcidId("");
    setRole("viewer");
    setActiveTab("email");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Collaborator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            Invite a researcher to collaborate on this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="email">By Email</TabsTrigger>
              <TabsTrigger value="orcid">By ORCID ID</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="researcher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={activeTab === "email"}
                />
                <p className="text-sm text-muted-foreground">
                  We'll send an invitation email to this address.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="orcid" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orcid">ORCID ID</Label>
                <Input
                  id="orcid"
                  type="text"
                  placeholder="0000-0000-0000-0000"
                  value={orcidId}
                  onChange={(e) => setOrcidId(e.target.value)}
                  required={activeTab === "orcid"}
                  pattern="^\d{4}-\d{4}-\d{4}-\d{4}$"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the 16-digit ORCID identifier in the format: 0000-0000-0000-0000
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2 mt-4">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Viewers can view data, contributors can add data, managers can manage collaborators.
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCollaboratorDialog;
