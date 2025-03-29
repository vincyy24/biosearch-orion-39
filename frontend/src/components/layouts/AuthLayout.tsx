
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
}

const AuthLayout = ({ 
  children, 
  title, 
  description, 
  showBackButton = true 
}: AuthLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {showBackButton && (
            <Button 
              variant="ghost" 
              className="mb-6" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          {children}
        </div>
      </div>
      
      {/* Right side - Background image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full object-cover bg-gradient-to-br from-primary/20 to-secondary/20">
          <div className="flex h-full items-center justify-center">
            <div className="max-w-2xl p-12 text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                ORION - Open Repository for Integrated Electrochemical Observation & Networking
              </h1>
              <p className="text-xl text-muted-foreground">
                Access advanced tools and comprehensive databases to accelerate your biomedical research
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
