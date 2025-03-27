
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Atom, FileText, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import OrcidVerification from "@/components/researchers/OrcidVerification";
import { getOrcidProfile } from "@/services/researchService";
import { OrcidProfile } from "@/types/common";

const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [orcidProfile, setOrcidProfile] = useState<OrcidProfile | null>(null);
  const [isLoadingOrcid, setIsLoadingOrcid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name || user.username);
      setEmail(user.email);
      fetchOrcidProfile();
    }
  }, [user]);

  const fetchOrcidProfile = async () => {
    if (!user?.orcid_verified) return;
    
    try {
      setIsLoadingOrcid(true);
      const response = await getOrcidProfile();
      setOrcidProfile(response.profile_data);
    } catch (error) {
      console.error("Error fetching ORCID profile:", error);
    } finally {
      setIsLoadingOrcid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUpdating(true);

      // In a real app, you'd call an API to update the profile
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOrcidVerificationComplete = () => {
    // In a real app, you would refresh the user data here
    // For now, we'll simulate a successful verification
    toast({
      title: "ORCID Verified",
      description: "Your ORCID ID has been successfully verified.",
    });
    fetchOrcidProfile();
  };

  if (!isAuthenticated || !user) {
    return (
      <AppLayout>
        <div className="container max-w-3xl py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">User Profile</CardTitle>
              <CardDescription>You need to be logged in to view this page.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-10 space-y-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://avatar.vercel.sh/${user.username}.png`} />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name || user.username}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </Badge>
                {user.orcid_verified && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <Atom className="h-3 w-3" />
                    ORCID Verified
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="researcher">Researcher Profile</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="text-xl">Account Information</CardTitle>
                  <CardDescription>
                    Update your account details and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support for assistance.</p>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
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
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="researcher" className="space-y-4">
            <OrcidVerification
              orcidId={user.orcid_id}
              isVerified={user.orcid_verified}
              profileData={orcidProfile}
              onVerificationComplete={handleOrcidVerificationComplete}
            />
          </TabsContent>
          
          <TabsContent value="publications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Publications</CardTitle>
                <CardDescription>
                  Manage your research publications and data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.orcid_verified ? (
                  <div className="space-y-4">
                    {isLoadingOrcid ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : orcidProfile && orcidProfile.works && orcidProfile.works.length > 0 ? (
                      <div className="space-y-4">
                        {orcidProfile.works.map((work, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                            <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                              <h3 className="font-medium">{work.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {work.type}, {work.year}
                              </p>
                              {work.url && (
                                <a
                                  href={work.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary text-sm"
                                >
                                  View publication
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No publications found</p>
                        <p className="text-sm mt-1">Publications linked to your ORCID profile will appear here.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Verify your ORCID ID to manage publications</p>
                    <p className="text-sm mt-1">
                      Go to the Researcher Profile tab to verify your ORCID ID.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default UserProfile;
