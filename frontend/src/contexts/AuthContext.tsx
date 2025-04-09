
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  getCurrentUser, 
  loginUser, 
  logoutUser, 
  registerUser,
  resetPassword as resetPasswordService,
  confirmResetPassword as confirmResetPasswordService
} from "@/services/auth";

interface User {
  id: string;
  name?: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAdmin?: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  confirmResetPassword: (token: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          // Transform the user data to match our User interface
          setUser({
            id: currentUser.id.toString(),
            username: currentUser.username,
            email: currentUser.email,
            first_name: currentUser.first_name,
            last_name: currentUser.last_name,
            is_staff: currentUser.is_staff,
            name: currentUser.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : currentUser.username
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await loginUser(email, password);
      
      if (response && response.user) {
        const userData = response.user;
        setUser({
          id: userData.id.toString(),
          username: userData.username,
          email: userData.email,
          name: userData.username // Default to username if name not provided
        });

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Login failed. Please check your credentials and try again.";

      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    toast({
      variant: "destructive",
      title: "Not implemented",
      description: "Google login is not available yet.",
    });
    return false;
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      await registerUser(username, email, password);
      toast({
        title: "Account created",
        description: "Your account has been successfully created! You can now log in.",
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Registration failed. Please try again.";

      toast({
        variant: "destructive",
        title: "Signup failed",
        description: errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user state even if the server request fails
      setUser(null);
      toast({
        variant: "destructive",
        title: "Logout completed with warnings",
        description: "You've been logged out locally, but there was an issue with the server. This won't affect your experience.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      await resetPasswordService(email);
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmResetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      await confirmResetPasswordService(token, password);
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      return true;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        isAdmin: user?.is_staff,
        login,
        loginWithGoogle,
        signup,
        logout,
        resetPassword,
        confirmResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
