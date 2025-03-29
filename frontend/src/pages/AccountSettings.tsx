
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Key,
  Bell,
  Save,
  CheckCircle,
  Shield,
  Mail,
  AlertTriangle,
  Loader2,
  Database,
  LogOut,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Profile settings
  const [name, setName] = useState(user?.name || user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [institution, setInstitution] = useState(user?.institution || "");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [researchUpdates, setResearchUpdates] = useState(true);
  const [publicationAlerts, setPublicationAlerts] = useState(true);
  const [communityMessages, setCommunityMessages] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-10">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                You need to be logged in to view this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/login")}>Log In</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: "There was a problem updating your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating preferences",
        description: "There was a problem updating your notification settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
      });
      return;
    }
    
    try {
      setSaving(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error changing password",
        description: "There was a problem updating your password. Please check your current password and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted. You will be logged out.",
      });
      
      // Logout and redirect after account deletion
      setTimeout(() => {
        logout();
        navigate("/");
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting account",
        description: "There was a problem deleting your account. Please try again later.",
      });
      setDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and public profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={user?.email}
                      disabled
                      className="pr-20"
                    />
                    <Badge
                      variant="outline"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your email address is used for login and notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    placeholder="University or organization"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    placeholder="Brief description of your research interests"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full min-h-[100px] p-2 rounded-md border resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>ORCID Integration</CardTitle>
                <CardDescription>
                  Connect your ORCID ID to automatically import publications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.orcid_verified ? (
                  <Alert className="bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>ORCID Connected</AlertTitle>
                    <AlertDescription>
                      Your ORCID ID ({user.orcid_id}) is connected to your account.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Connect your ORCID ID to enhance your profile</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={() => navigate("/profile?tab=researcher")}
                    >
                      Connect ORCID
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Notification Types</h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-md bg-blue-100 dark:bg-blue-900">
                        <Microscope className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <Label>Research Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Updates on your research projects
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={researchUpdates}
                      onCheckedChange={setResearchUpdates}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-md bg-purple-100 dark:bg-purple-900">
                        <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <Label>Publication Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Updates on your publications and citations
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={publicationAlerts}
                      onCheckedChange={setPublicationAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-md bg-green-100 dark:bg-green-900">
                        <Users className="h-4 w-4 text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <Label>Community Messages</Label>
                        <p className="text-sm text-muted-foreground">
                          Messages from other researchers
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={communityMessages}
                      onCheckedChange={setCommunityMessages}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-md bg-amber-100 dark:bg-amber-900">
                        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div>
                        <Label>Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Important security notifications
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={securityAlerts}
                      onCheckedChange={setSecurityAlerts}
                      disabled={true} // Security alerts should always be enabled
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>
                  Manage your data and account deletion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Download Your Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export all your research data, publications, and account information
                  </p>
                  <Button variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Request Data Export
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2 text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Publications associated with your account will remain in the system.
                  </p>
                  
                  <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove your access to all research projects. All publications
                          associated with your account will remain in the system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Warning</AlertTitle>
                          <AlertDescription>
                            All your personal data and research projects will be permanently removed.
                          </AlertDescription>
                        </Alert>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Permanently Delete Account
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AccountSettings;
