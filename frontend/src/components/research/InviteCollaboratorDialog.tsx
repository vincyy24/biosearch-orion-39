
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
import { Users, Mail, Search } from "lucide-react";

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
  const [inviteType, setInviteType] = useState<"email" | "search">("search");
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Mock API call for now
      // In a real app, replace with actual API call
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
      if (inviteType === "email" && !email) {
        toast({
          title: "Error",
          description: "Please enter an email address.",
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

      // Mock API call for now
      // In a real app, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Invitation sent",
        description: inviteType === "email" 
          ? `Invitation sent to ${email}` 
          : `Invitation sent to ${selectedUser?.name || selectedUser?.username}`
      });
      
      onOpenChange(false);
      if (onInviteSuccess) onInviteSuccess();
      
      // Reset form
      setEmail("");
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
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search by name, username or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
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
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer (can only view)</SelectItem>
                <SelectItem value="contributor">Contributor (can edit)</SelectItem>
                <SelectItem value="admin">Admin (full control)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            <Users className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCollaboratorDialog;
