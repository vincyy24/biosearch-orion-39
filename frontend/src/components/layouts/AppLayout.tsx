import React, { ReactNode, useState, useEffect } from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import Footer from "@/components/layouts/Footer";
import { SidebarProvider } from "../ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showSidebar = true,
  showFooter = true
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated } = useAuth();

  // Check if the current window width is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Determine whether to show the sidebar based on auth status
  const shouldShowSidebar = showSidebar && !isMobile;

  return (
    <SidebarProvider>
      <div className="flex flex-1 min-h-screen bg-background">
        {shouldShowSidebar && (
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        )}
        <div className="flex flex-col flex-1 min-h-screen overflow-x-hidden">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          {showFooter && <Footer />}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
