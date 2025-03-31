
import React, { ReactNode, useState, useEffect } from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import Footer from "@/components/layouts/Footer";
import { SidebarProvider } from "../ui/sidebar";

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {showSidebar && !isMobile && <Sidebar />}
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
