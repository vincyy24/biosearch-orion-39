
<<<<<<< Updated upstream
import React, { ReactNode } from 'react';
import Navbar from '@/components/navigation/Navbar';
import Sidebar from '@/components/navigation/Sidebar';
=======
import { ReactNode } from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
>>>>>>> Stashed changes

interface AppLayoutProps {
  children: ReactNode;
}

<<<<<<< Updated upstream
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <div className="fixed h-full z-20">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col pl-16 lg:pl-64">
          <div className="sticky top-0 z-10">
            <Navbar />
          </div>
          <div className="flex-1 overflow-auto">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
=======
const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="py-6 px-4 bg-background border-t">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} ORION - All rights reserved.
                  </p>
                </div>
                <div className="flex gap-8">
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                  <button
                    onClick={() => navigate('/support')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </SidebarInset>
>>>>>>> Stashed changes
      </div>
    </div>
  );
};

export default AppLayout;
