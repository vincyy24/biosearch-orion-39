
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

const VerifyEmail = () => {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      // Get uid and token from URL params
      const params = new URLSearchParams(location.search);
      const uid = params.get("uid");
      const token = params.get("token");

      if (!uid || !token) {
        setStatus("error");
        setErrorMessage("Invalid verification link. Please check your email and try again.");
        return;
      }

      try {
        // In a real app, this would be an API call to verify the email
        // For now, just simulate the API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate success for demonstration purposes
        setStatus("success");

        // Redirect to dashboard after successful verification
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while verifying your email. Please try again."
        );
      }
    };

    if (!isAuthenticated) {
      verifyEmail();
    } else {
      // User is already authenticated, redirect to dashboard
      navigate("/dashboard");
    }
  }, [location.search, navigate, isAuthenticated]);

  return (
    <AuthLayout
      title={
        status === "verifying"
          ? "Verifying your email..."
          : status === "success"
          ? "Email verified!"
          : "Verification failed"
      }
      description={
        status === "verifying"
          ? "Please wait while we verify your email address"
          : status === "success"
          ? "Your account has been successfully activated"
          : "We couldn't verify your email address"
      }
      showBackButton={false}
    >
      {status === "verifying" ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            Verifying your email address. This should only take a moment...
          </p>
        </div>
      ) : status === "success" ? (
        <div className="space-y-6">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertDescription>
              Your email has been successfully verified and your account is now active.
            </AlertDescription>
          </Alert>

          <p className="text-center text-muted-foreground">
            You will be redirected to the dashboard in a few seconds...
          </p>

          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="flex flex-col space-y-3 mt-6">
            <Button onClick={() => navigate("/signup")}>
              Back to Sign Up
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default VerifyEmail;
