
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
        <Sidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer></Footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
