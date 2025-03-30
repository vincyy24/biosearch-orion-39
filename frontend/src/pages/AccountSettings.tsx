
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  AlertCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Key, 
  Loader2, 
  Lock, 
  Mail, 
  Save, 
  Shield, 
  Trash2, 
  User 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AccountSettings = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { 
        replace: true, 
        state: { from: { pathname: "/account-settings" } } 
      });
    }
    
    // Initialize form with user data
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setUsername(user.username || "");
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUsernameUpdate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate username
      if (!username) {
        throw new Error("Username cannot be empty");
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Username updated",
        description: "Your username has been updated successfully."
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update username. Please try again.");
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err instanceof Error ? err.message : "There was an error updating your username."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate passwords
      if (!currentPassword) {
        throw new Error("Current password is required");
      }
      
      if (!newPassword) {
        throw new Error("New password is required");
      }
      
      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match");
      }
      
      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password. Please try again.");
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err instanceof Error ? err.message : "There was an error updating your password."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAccountDelete = async () => {
    setLoading(true);
    
    try {
      // Validate password
      if (!deleteConfirmPassword) {
        throw new Error("Password is required to confirm account deletion");
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      
      // Log out user
      await logout();
      
      // Redirect to home page
      navigate("/", { replace: true });
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully."
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: err instanceof Error ? err.message : "There was an error deleting your account."
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Loading your account settings...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  if (!isAuthenticated) {
    return null; // The useEffect will redirect to login
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-52 space-y-6">
              <TabsList className="flex flex-col h-auto w-full p-0 bg-transparent space-y-1">
                <TabsTrigger 
                  value="profile" 
                  className="justify-start w-full px-3 py-2 h-9"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="username" 
                  className="justify-start w-full px-3 py-2 h-9"
                >
                  <User className="h-4 w-4 mr-2" />
                  Username
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="justify-start w-full px-3 py-2 h-9"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger 
                  value="danger" 
                  className="justify-start w-full px-3 py-2 h-9 text-destructive"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Danger Zone
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 space-y-6">
              <TabsContent value="profile" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        disabled
                        placeholder="Your email address"
                      />
                      <p className="text-sm text-muted-foreground">
                        Your email address is used for login and cannot be changed.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleProfileUpdate} 
                      disabled={loading}
                    >
                      {loading ? (
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
              </TabsContent>
              
              <TabsContent value="username" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Username</CardTitle>
                    <CardDescription>
                      Update your username
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Your username"
                      />
                      <p className="text-sm text-muted-foreground">
                        Your username is used for your profile URL and @mentions.
                      </p>
                    </div>
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleUsernameUpdate} 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Username
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input 
                          id="current-password" 
                          type={showCurrentPassword ? "text" : "password"} 
                          value={currentPassword} 
                          onChange={(e) => setCurrentPassword(e.target.value)} 
                          placeholder="Enter your current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="new-password" 
                          type={showNewPassword ? "text" : "password"} 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          placeholder="Enter your new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Password must be at least 8 characters long.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="Confirm your new password"
                      />
                    </div>
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handlePasswordUpdate} 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        id="two-factor"
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="login-alerts">Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone logs into your account
                        </p>
                      </div>
                      <Switch
                        id="login-alerts"
                        checked={loginAlertsEnabled}
                        onCheckedChange={setLoginAlertsEnabled}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="danger" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        Deleting your account will permanently remove all your data, including projects, datasets, and settings. This action cannot be undone.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
        
        {/* Delete Account Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                This action is irreversible. All your data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This will permanently delete your account and all associated data.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="delete-confirm-password">
                  Enter your password to confirm
                </Label>
                <div className="relative">
                  <Input 
                    id="delete-confirm-password" 
                    type="password" 
                    value={deleteConfirmPassword} 
                    onChange={(e) => setDeleteConfirmPassword(e.target.value)} 
                    placeholder="Your current password"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleAccountDelete}
                disabled={loading || !deleteConfirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete My Account"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AccountSettings;
