
import { ReactNode } from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar-persistent";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
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
                    &copy; {new Date().getFullYear()} BiomediResearch Platform. All rights reserved.
                  </p>
                </div>
                <div className="flex gap-8">
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
