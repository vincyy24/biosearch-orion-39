
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const { resetPassword, confirmResetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL for reset token parameters
    const params = new URLSearchParams(location.search);
    const uid = params.get("uid");
    const token = params.get("token");
    
    if (uid && token) {
      setIsResetMode(true);
    }
  }, [location]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    
    const success = await resetPassword(email);
    if (success) {
      setSuccessMessage("We've sent a password reset link to your email address. Please check your inbox.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!password || !confirmPassword) {
      setErrorMessage("Please enter and confirm your new password");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    const params = new URLSearchParams(location.search);
    const uid = params.get("uid");
    const token = params.get("token");
    
    if (!uid || !token) {
      setErrorMessage("Invalid reset link");
      return;
    }
    
    const success = await confirmResetPassword(uid, token, password);
    if (success) {
      // Redirect to login page after successful password reset
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <AuthLayout 
      title={isResetMode ? "Reset your password" : "Forgot your password?"}
      description={isResetMode 
        ? "Enter your new password below"
        : "Enter your email and we'll send you a link to reset your password"
      }
    >
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="default" className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {isResetMode ? (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading || !!successMessage}>
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRequestReset} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading || !!successMessage}>
            {loading ? "Sending Reset Link..." : "Send Reset Link"}
          </Button>
          
          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => navigate("/login")}
            >
              Back to login
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
