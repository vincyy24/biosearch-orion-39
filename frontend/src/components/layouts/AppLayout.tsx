
import React, { ReactNode } from "react";
import Sidebar from "../navigation/Sidebar";
import Navbar from "../navigation/Navbar";
import Footer from "../ui/footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar with sticky positioning */}
      <Sidebar className="hidden md:flex" />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-auto">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
