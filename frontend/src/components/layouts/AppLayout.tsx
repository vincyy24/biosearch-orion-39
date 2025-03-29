
import React, { ReactNode } from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import Footer from "../ui/footer";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
        <SidebarInset className="flex flex-col min-h-screen w-full">
          <Navbar />
          <main className={cn("flex-1 px-4 sm:px-6 lg:px-8 py-6", className)}>
            {children}
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
