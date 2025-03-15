
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for stored authentication on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // TODO: Replace this with actual API call to Django backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication for now
      if (email && password) {
        const mockUser: User = {
          id: "1",
          email,
          name: email.split('@')[0],
          role: email.includes("admin") ? "admin" : "user"
        };
        
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
        
        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        });
        
        return true;
      }
      
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    try {
      // TODO: Implement Google authentication with Django backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock Google authentication
      const mockUser: User = {
        id: "g-123",
        email: "user@example.com",
        name: "Google User",
        role: "user"
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      toast({
        title: "Google login successful",
        description: "You have been logged in with Google successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: "An error occurred during Google login. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to Django backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock signup
      if (name && email && password) {
        // In a real app, we would create the user and then log them in
        const mockUser: User = {
          id: "2",
          email,
          name,
          role: "user"
        };
        
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
        
        toast({
          title: "Signup successful",
          description: "Your account has been created successfully.",
        });
        
        return true;
      }
      
      toast({
        title: "Signup failed",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "An error occurred during signup. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logout successful",
      description: "You have been logged out successfully.",
    });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    loginWithGoogle,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
