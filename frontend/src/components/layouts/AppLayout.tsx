
import React, { ReactNode } from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-16 md:ml-64"> {/* Space for sidebar */}
        <Navbar />
        <main className={cn("min-h-screen", className)}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
