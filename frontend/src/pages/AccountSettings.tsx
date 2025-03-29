
import React, { useState } from "react";
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Lock,
  Bell,
  Eye,
  EyeOff,
  Shield,
  Key,
  AlertTriangle,
  Mail,
  UserCircle,
  AtSign,
  Save
} from "lucide-react";

const AccountSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  
  // Profile state
  const [username, setUsername] = useState(user?.username || "");
  const [fullName, setFullName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [researchUpdates, setResearchUpdates] = useState(true);
  const [publicationCitations, setPublicationCitations] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [collaborationInvites, setCollaborationInvites] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setIsUpdatingNotifications(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been updated successfully."
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your notification settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== "DELETE") {
      toast({
        title: "Invalid confirmation",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully."
      });
      
      setIsDeleteDialogOpen(false);
      // In a real app, you'd log the user out and redirect
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting your account. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and settings
          </p>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Lock className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle className="mr-2 h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and public profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="Your email"
                        value={user?.email || ""}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Contact support to change your email address
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center">
                      <AtSign className="mr-1 h-4 w-4" /> Username
                    </Label>
                    <Input
                      id="username"
                      placeholder="Your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be your public username on the platform
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      placeholder="A short bio about yourself"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tell others about your research interests and expertise
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  Password
                </CardTitle>
                <CardDescription>
                  Update your password to maintain account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This action cannot be undone. Your research data and publications will remain accessible on the platform, but your account will be removed.
                </p>
                <Button 
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Research Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Updates to research projects you're part of
                      </p>
                    </div>
                    <Switch
                      checked={researchUpdates}
                      onCheckedChange={setResearchUpdates}
                      disabled={!emailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Publication Citations</h4>
                      <p className="text-sm text-muted-foreground">
                        Notifications when your publications are cited
                      </p>
                    </div>
                    <Switch
                      checked={publicationCitations}
                      onCheckedChange={setPublicationCitations}
                      disabled={!emailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Comments & Mentions</h4>
                      <p className="text-sm text-muted-foreground">
                        When someone comments on or mentions you
                      </p>
                    </div>
                    <Switch
                      checked={commentNotifications}
                      onCheckedChange={setCommentNotifications}
                      disabled={!emailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Collaboration Invites</h4>
                      <p className="text-sm text-muted-foreground">
                        Invitations to collaborate on research
                      </p>
                    </div>
                    <Switch
                      checked={collaborationInvites}
                      onCheckedChange={setCollaborationInvites}
                      disabled={!emailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Digest</h4>
                      <p className="text-sm text-muted-foreground">
                        Weekly summary of platform activity
                      </p>
                    </div>
                    <Switch
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                      disabled={!emailNotifications}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleUpdateNotifications}
                  disabled={isUpdatingNotifications || !emailNotifications}
                >
                  {isUpdatingNotifications ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <p className="text-sm">
              Please type <strong>DELETE</strong> to confirm that you want to permanently delete your account.
            </p>
            <Input
              placeholder="Type DELETE to confirm"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              className="border-destructive/50 focus-visible:ring-destructive/30"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={confirmDelete !== "DELETE"}
            >
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AccountSettings;
