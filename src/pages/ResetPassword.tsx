
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/layouts/AuthLayout";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // This is a placeholder for the actual password reset logic
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email) {
        setIsSubmitted(true);
        toast({
          title: "Reset email sent",
          description: "If an account with that email exists, you will receive password reset instructions.",
        });
      } else {
        toast({
          title: "Email required",
          description: "Please enter your email address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Request failed",
        description: "An error occurred while processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout 
        title="Check your email" 
        description="We've sent you an email with a link to reset your password."
      >
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            If you don't receive an email within a few minutes, please check your spam folder.
          </p>
          
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate("/login")}
          >
            Back to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset your password" 
      description="Enter your email to receive a password reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending reset link..." : "Send reset link"}
        </Button>
        
        <Button 
          type="button" 
          className="w-full" 
          variant="outline"
          onClick={() => navigate("/login")}
        >
          Back to login
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
