
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
import { Loader2, UserPlus, Search, Users, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs based on active tab
      if (activeTab === "email" && !email) {
        toast({
          variant: "destructive",
          title: "Email required",
          description: "Please enter an email address to invite a collaborator."
        });
        return;
      }

      if (activeTab === "orcid" && !orcidId) {
        toast({
          variant: "destructive",
          title: "ORCID ID required",
          description: "Please enter an ORCID ID to invite a collaborator."
        });
        return;
      }

      if (activeTab === "search" && !selectedUser) {
        toast({
          variant: "destructive",
          title: "No user selected",
          description: "Please select a user to invite as a collaborator."
        });
        return;
      }

      // Prepare invite data
      const inviteData = {
        project_id: projectId,
        email: activeTab === "email" ? email : activeTab === "search" ? selectedUser?.email : undefined,
        orcid_id: activeTab === "orcid" ? orcidId : undefined,
        role
      };

      console.log("Sending invitation with data:", inviteData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Invitation sent",
        description: activeTab === "email" 
          ? `Invitation sent to ${email}` 
          : activeTab === "orcid"
          ? `Invitation sent to ORCID ID: ${orcidId}`
          : `Invitation sent to ${selectedUser?.name || selectedUser?.username}`
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
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setRole("viewer");
    setActiveTab("email");
  };

  // If not authenticated, don't show the dialog trigger
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Collaborator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            Invite a researcher to collaborate on this project. They will receive a notification if they're registered, or an email if they're not.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="email">By Email</TabsTrigger>
              <TabsTrigger value="orcid">By ORCID ID</TabsTrigger>
              <TabsTrigger value="search">Search Users</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll send an invitation email. If they're already registered, they'll also receive a notification.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="orcid" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orcid">ORCID ID</Label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="orcid"
                    type="text"
                    placeholder="0000-0000-0000-0000"
                    value={orcidId}
                    onChange={(e) => setOrcidId(e.target.value)}
                    pattern="^\d{4}-\d{4}-\d{4}-\d{4}$"
                    disabled={loading}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the 16-digit ORCID identifier in the format: 0000-0000-0000-0000
                </p>
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search for users</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, username or email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim() || searchQuery.length < 2}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Search for users already registered on the platform
                </p>
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-md overflow-hidden mt-2">
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
                <div className="text-center py-3 border rounded-md text-muted-foreground">
                  No users found matching "{searchQuery}"
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="space-y-2 mt-4">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer (can only view)</SelectItem>
                <SelectItem value="contributor">Contributor (can edit)</SelectItem>
                <SelectItem value="admin">Admin (full control)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "viewer" 
                ? "Viewers can view data but cannot make changes." 
                : role === "contributor" 
                ? "Contributors can add data and make changes." 
                : "Admins can manage collaborators and have full control."}
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
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
