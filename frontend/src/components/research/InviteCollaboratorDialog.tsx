
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
}

interface InviteCollaboratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onInviteSuccess?: () => void;
}

const InviteCollaboratorDialog: React.FC<InviteCollaboratorDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onInviteSuccess
}) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [inviteType, setInviteType] = useState<"email" | "orcid" | "search">("search");
  const [email, setEmail] = useState("");
  const [orcidId, setOrcidId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      toast({
        title: "Search query too short",
        description: "Please enter at least 2 characters to search",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // In a real app, this would call the API
      // For now, we'll simulate the API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate search results
      const mockResults: User[] = [
        { id: "u1", username: "janesmith", email: "jane.smith@example.com", name: "Dr. Jane Smith" },
        { id: "u2", username: "michaelchen", email: "michael.chen@example.com", name: "Dr. Michael Chen" },
        { id: "u3", username: "sarahjohnson", email: "sarah.johnson@example.com", name: "Sarah Johnson" }
      ].filter(user => 
        user.username.includes(searchQuery.toLowerCase()) || 
        user.email.includes(searchQuery.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setSearchResults(mockResults);
      if (mockResults.length === 0) {
        toast({
          title: "No results found",
          description: `No users found matching "${searchQuery}"`,
        });
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Search failed",
        description: "There was an error searching for users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    setLoading(true);
    try {
      // Validate inputs
      if (inviteType === "email" && !email) {
        toast({
          title: "Error",
          description: "Please enter an email address.",
          variant: "destructive"
        });
        return;
      }

      if (inviteType === "orcid" && !orcidId) {
        toast({
          title: "Error",
          description: "Please enter an ORCID ID.",
          variant: "destructive"
        });
        return;
      }

      if (inviteType === "search" && !selectedUser) {
        toast({
          title: "Error",
          description: "Please select a user to invite.",
          variant: "destructive"
        });
        return;
      }

      // Prepare invite data
      const inviteData = {
        email: inviteType === "email" ? email : inviteType === "search" ? selectedUser?.email : undefined,
        orcid_id: inviteType === "orcid" ? orcidId : undefined,
        role
      };

      // In a real app, this would call the API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Invitation sent",
        description: inviteType === "email" 
          ? `Invitation sent to ${email}` 
          : inviteType === "orcid"
          ? `Invitation sent to ORCID ID: ${orcidId}`
          : `Invitation sent to ${selectedUser?.name || selectedUser?.username}`
      });
      
      onOpenChange(false);
      if (onInviteSuccess) onInviteSuccess();
      
      // Reset form
      setEmail("");
      setOrcidId("");
      setSearchQuery("");
      setSelectedUser(null);
      setSearchResults([]);
      
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      toast({
        title: "Invitation failed",
        description: "There was an error sending the invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, don't show the dialog
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Invite Collaborator
          </DialogTitle>
          <DialogDescription>
            Invite a collaborator to your research project. They will be able to view or edit the project based on the role you assign.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant={inviteType === "search" ? "default" : "outline"} 
            onClick={() => setInviteType("search")}
            className="flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Find User
          </Button>
          <Button 
            variant={inviteType === "email" ? "default" : "outline"} 
            onClick={() => setInviteType("email")}
            className="flex-1"
          >
            <Mail className="h-4 w-4 mr-2" />
            Invite by Email
          </Button>
          <Button 
            variant={inviteType === "orcid" ? "default" : "outline"} 
            onClick={() => setInviteType("orcid")}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            ORCID ID
          </Button>
        </div>
        
        <div className="space-y-4 mt-4">
          {inviteType === "email" ? (
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                We'll send an invitation email. If they're already registered, they'll also receive a notification.
              </p>
            </div>
          ) : inviteType === "orcid" ? (
            <div className="space-y-2">
              <Label htmlFor="orcid">ORCID ID</Label>
              <Input
                id="orcid"
                placeholder="0000-0000-0000-0000"
                value={orcidId}
                onChange={(e) => setOrcidId(e.target.value)}
                pattern="^\d{4}-\d{4}-\d{4}-\d{4}$"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Enter the 16-digit ORCID identifier (format: 0000-0000-0000-0000)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search by name, username or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  disabled={loading}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  {searchResults.map((user) => (
                    <div 
                      key={user.id}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted ${
                        selectedUser?.id === user.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div>
                        <p className="font-medium">{user.name || user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {selectedUser?.id === user.id && (
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery && searchResults.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-2">
                  No users found matching "{searchQuery}"
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="role">Collaborator role</Label>
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer (can only view)</SelectItem>
                <SelectItem value="contributor">Contributor (can edit)</SelectItem>
                <SelectItem value="admin">Admin (full control)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {role === "viewer" ? "Viewers can only view project data and files."
                : role === "contributor" ? "Contributors can edit data and add files to the project."
                : "Admins have full control including inviting other collaborators."}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCollaboratorDialog;
