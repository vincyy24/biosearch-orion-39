import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Database, ExternalLink, Mail, MessageSquare, User, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PublicationCard from "@/components/publications/PublicationCard";
import { fetchUserProfile } from "@/services/api";

interface Publication {
  id: string;
  title: string;
  journal: string;
  year: string;
  doi?: string;
}

interface Dataset {
  id: string;
  file_name: string;
  description: string;
  upload_date: string;
}

interface UserProfile {
  id: string;
  username: string;
  name: string;
  publications: Publication[];
  datasets: Dataset[];
  joined_date: string;
  orcid_id?: string;
  email?: string;
}

interface ViewUserProfileProps {
  username: string;
  onError?: (message: string) => void;
}

const ViewUserProfile: React.FC<ViewUserProfileProps> = ({ username, onError }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const profileData = await fetchUserProfile(username);
        setProfile(profileData);
      } catch (error) {
        console.error("Error loading user profile:", error);
        if (onError) {
          onError("Failed to load user profile");
        } else {
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadUserProfile();
    }
  }, [username, toast, onError]);

  const handleConnectClick = () => {
    toast({
      title: "Request sent",
      description: `Connection request sent to ${profile?.name}`,
    });
  };

  const handleMessageClick = () => {
    toast({
      description: "Messaging functionality will be available soon!",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested user profile could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  const isOwnProfile = user?.username === username;
  const joinedDate = new Date(profile.joined_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${profile.username}`} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">{profile.name}</CardTitle>
                <div className="text-muted-foreground mt-1 flex items-center">
                  @{profile.username}
                  <Badge variant="outline" className="ml-2">Researcher</Badge>
                </div>
              </div>
            </div>
            
            {!isOwnProfile && isAuthenticated && (
              <div className="flex gap-2">
                <Button onClick={handleConnectClick}>
                  <Users className="h-4 w-4 mr-2" />
                  Connect
                </Button>
                <Button variant="outline" onClick={handleMessageClick}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Joined {joinedDate} • {profile.publications.length} publications • {profile.datasets.length} datasets</p>
          </div>
          <Separator className="my-4" />
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="datasets">Datasets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" /> Recent Publications
                  </h3>
                  {profile.publications.length > 0 ? (
                    <div className="space-y-3">
                      {profile.publications.slice(0, 2).map(pub => (
                        <div key={pub.id} className="rounded-lg border p-3">
                          <h4 className="font-medium">{pub.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pub.journal}, {pub.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No publications yet</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Database className="mr-2 h-5 w-5" /> Recent Datasets
                  </h3>
                  {profile.datasets.length > 0 ? (
                    <div className="space-y-3">
                      {profile.datasets.slice(0, 2).map(dataset => (
                        <div key={dataset.id} className="rounded-lg border p-3">
                          <h4 className="font-medium">{dataset.file_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {dataset.description.substring(0, 60)}
                            {dataset.description.length > 60 ? '...' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploaded on {new Date(dataset.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No datasets yet</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Contact</h3>
                <Button variant="outline" size="sm" className="mr-2">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  ORCID Profile
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="publications">
              <h3 className="text-lg font-semibold mb-4">Publications</h3>
              {profile.publications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.publications.map(pub => (
                    <PublicationCard 
                      key={pub.id}
                      publication={{
                        id: pub.id,
                        title: pub.title,
                        journal: pub.journal,
                        year: pub.year,
                        doi: "10.1000/example",
                      }}
                      onView={() => {}} // Would navigate to publication detail
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No publications available</p>
              )}
            </TabsContent>
            
            <TabsContent value="datasets">
              <h3 className="text-lg font-semibold mb-4">Datasets</h3>
              {profile.datasets.length > 0 ? (
                <div className="space-y-4">
                  {profile.datasets.map(dataset => (
                    <Card key={dataset.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{dataset.file_name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{dataset.description}</p>
                        <p className="text-sm mt-2">
                          Uploaded on {new Date(dataset.upload_date).toLocaleDateString()}
                        </p>
                        <Button className="mt-3" size="sm">View Dataset</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No datasets available</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewUserProfile;
