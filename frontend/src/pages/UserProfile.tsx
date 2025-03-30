
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";
import ViewUserProfile from "@/components/users/ViewUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If no username provided and authenticated, redirect to own profile
    if (!username && isAuthenticated && user) {
      navigate(`/profile/${user.username}`, { replace: true });
    }
    
    // If not authenticated and no username, redirect to login
    if (!username && !authLoading && !isAuthenticated) {
      navigate("/login", { 
        replace: true,
        state: { from: { pathname: "/profile" } } 
      });
    }
    
    setLoading(false);
  }, [username, user, isAuthenticated, authLoading, navigate]);

  const handleError = (message: string) => {
    setError(message);
  };

  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Loading Profile</CardTitle>
              <CardDescription>Please wait while we load the profile information...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>We encountered a problem loading this profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/", { replace: true })}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // If we've reached this point but have no username, show a not found error
  // This case is a fallback, as the useEffect should redirect if possible
  if (!username) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Profile Not Found</CardTitle>
              <CardDescription>The requested profile could not be found</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/", { replace: true })}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 max-w-4xl">
        <ViewUserProfile username={username} onError={handleError} />
      </div>
    </AppLayout>
  );
};

export default UserProfile;
