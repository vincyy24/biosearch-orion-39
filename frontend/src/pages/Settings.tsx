import { useState } from "react";
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Trash2, Shield, Eye, Bell, Palette, Save, User } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  
  // Appearance Settings
  const [fontSize, setFontSize] = useState("medium");
  const [density, setDensity] = useState("comfortable");
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  
  // Privacy Settings
  const [dataVisibility, setDataVisibility] = useState("private");
  const [shareResearchInterests, setShareResearchInterests] = useState(false);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [dataUsageConsent, setDataUsageConsent] = useState(true);
  const [personalizationPreferences, setPersonalizationPreferences] = useState(true);
  
  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    localStorage.setItem("user-settings", JSON.stringify({
      appearance: {
        theme,
        fontSize,
        density,
        showWelcomeScreen
      },
      privacy: {
        dataVisibility,
        shareResearchInterests,
        showActivityStatus,
        dataUsageConsent,
        personalizationPreferences
      }
    }));
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };
  
  const handleExportData = () => {
    toast({
      title: "Data export initiated",
      description: "Your data will be prepared for download. You'll receive an email notification when it's ready.",
    });
  };
  
  const handleDeleteData = () => {
    toast({
      title: "Warning",
      description: "This action cannot be undone. Please contact support to process your data deletion request.",
      variant: "destructive",
    });
  };

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and platform settings
          </p>
        </div>
        
        <Tabs defaultValue="appearance">
          <TabsList className="mb-6">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize how the ORION platform looks and feels
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme-toggle" className="font-medium">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <Switch 
                    id="theme-toggle"
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label htmlFor="font-size" className="font-medium">Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger id="font-size">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="density" className="font-medium">Layout Density</Label>
                  <Select value={density} onValueChange={setDensity}>
                    <SelectTrigger id="density">
                      <SelectValue placeholder="Select layout density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="welcome-toggle" className="font-medium">Welcome Screen</Label>
                    <p className="text-sm text-muted-foreground">
                      Show welcome screen on startup
                    </p>
                  </div>
                  <Switch 
                    id="welcome-toggle"
                    checked={showWelcomeScreen}
                    onCheckedChange={setShowWelcomeScreen}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button onClick={handleSaveSettings} className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control how your data is used and shared on the platform
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="data-visibility" className="font-medium">Data Visibility</Label>
                  <Select value={dataVisibility} onValueChange={setDataVisibility}>
                    <SelectTrigger id="data-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (visible to everyone)</SelectItem>
                      <SelectItem value="limited">Limited (visible to registered users)</SelectItem>
                      <SelectItem value="private">Private (visible only to you)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="research-interests-toggle" className="font-medium">Share Research Interests</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see your research interests
                    </p>
                  </div>
                  <Switch 
                    id="research-interests-toggle"
                    checked={shareResearchInterests}
                    onCheckedChange={setShareResearchInterests}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activity-status-toggle" className="font-medium">Show Activity Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Display when you're active on the platform
                    </p>
                  </div>
                  <Switch 
                    id="activity-status-toggle"
                    checked={showActivityStatus}
                    onCheckedChange={setShowActivityStatus}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-consent-toggle" className="font-medium">Data Usage & Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow us to collect usage data to improve the platform
                    </p>
                  </div>
                  <Switch 
                    id="data-consent-toggle"
                    checked={dataUsageConsent}
                    onCheckedChange={setDataUsageConsent}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="personalization-toggle" className="font-medium">Personalization</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow personalized recommendations based on your activity
                    </p>
                  </div>
                  <Switch 
                    id="personalization-toggle"
                    checked={personalizationPreferences}
                    onCheckedChange={setPersonalizationPreferences}
                  />
                </div>
                
                <Separator />
                
                <div className="pt-2 space-y-4">
                  <h3 className="font-medium">Data Management</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      className="sm:flex-1"
                      onClick={handleExportData}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export All Data
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="sm:flex-1"
                      onClick={handleDeleteData}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Request Data Deletion
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button onClick={handleSaveSettings} className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account details and security preferences
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Account settings will be implemented in a future update
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Control when and how you receive notifications
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Notification settings will be implemented in a future update
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
