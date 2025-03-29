
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Globe,
  BookOpen,
  Microscope,
  Database,
  Users,
  MessageSquare,
  Check,
  UserPlus,
  ExternalLink
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string;
  bio?: string;
  institution?: string;
  orcidId?: string;
  avatarUrl?: string;
  isFollowing?: boolean;
  publications?: number;
  researchProjects?: number;
  datasets?: number;
  followers?: number;
  following?: number;
}

interface ViewUserProfileProps {
  username: string;
  isLoading?: boolean;
}

const ViewUserProfile: React.FC<ViewUserProfileProps> = ({ username, isLoading = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("publications");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user profile data
        const mockProfile: UserProfile = {
          id: "u123",
          username: username,
          name: "Dr. Jane Smith",
          bio: "Researcher in electrochemical methods and materials science. Focused on developing novel sensing platforms for environmental monitoring.",
          institution: "University of Science & Technology",
          orcidId: "0000-0001-2345-6789",
          isFollowing: false,
          publications: 24,
          researchProjects: 12,
          datasets: 45,
          followers: 87,
          following: 34
        };
        
        setUserProfile(mockProfile);
        setIsFollowing(mockProfile.isFollowing || false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [username, toast]);

  const handleFollow = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsFollowing(!isFollowing);
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? `You are no longer following ${userProfile?.name || username}`
          : `You are now following ${userProfile?.name || username}`
      });
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast({
        title: "Action failed",
        description: "There was an error processing your request.",
        variant: "destructive"
      });
    }
  };

  const handleMessage = () => {
    // In a real app, this would open a message composer or chat
    toast({
      title: "Message feature",
      description: "Messaging feature is coming soon."
    });
  };

  const handleInvite = () => {
    // In a real app, this would show an invite dialog
    toast({
      title: "Invite feature",
      description: "Invite collaboration feature is coming soon."
    });
  };

  if (isLoading || loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-medium mb-2">User Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The user profile you're looking for doesn't exist or is not accessible.
          </p>
          <Button onClick={() => navigate("/search")}>
            Search for Users
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
            <AvatarFallback className="text-lg">
              {userProfile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">{userProfile.name}</CardTitle>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  <span>@{userProfile.username}</span>
                  {userProfile.orcidId && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      ORCID
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mt-3 sm:mt-0">
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  onClick={handleFollow}
                >
                  {isFollowing ? (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-4 w-4" /> Follow
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleMessage}>
                  <MessageSquare className="mr-1 h-4 w-4" /> Message
                </Button>
                <Button variant="outline" size="sm" onClick={handleInvite}>
                  <Users className="mr-1 h-4 w-4" /> Invite
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
              {userProfile.institution && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="mr-1 h-4 w-4" />
                  {userProfile.institution}
                </div>
              )}
              {userProfile.orcidId && (
                <a 
                  href={`https://orcid.org/${userProfile.orcidId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  ORCID: {userProfile.orcidId}
                </a>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {userProfile.bio && (
          <p className="text-sm mb-4">{userProfile.bio}</p>
        )}
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm">
          <div className="flex items-center">
            <BookOpen className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{userProfile.publications}</span>
            <span className="ml-1 text-muted-foreground">Publications</span>
          </div>
          <div className="flex items-center">
            <Microscope className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{userProfile.researchProjects}</span>
            <span className="ml-1 text-muted-foreground">Research Projects</span>
          </div>
          <div className="flex items-center">
            <Database className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{userProfile.datasets}</span>
            <span className="ml-1 text-muted-foreground">Datasets</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{userProfile.followers}</span>
            <span className="ml-1 text-muted-foreground">Followers</span>
          </div>
        </div>
        
        <Tabs 
          defaultValue="publications" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="publications" className="pt-4">
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Publications will be displayed here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="research" className="pt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Microscope className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Research projects will be displayed here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="datasets" className="pt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Datasets will be displayed here</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ViewUserProfile;
