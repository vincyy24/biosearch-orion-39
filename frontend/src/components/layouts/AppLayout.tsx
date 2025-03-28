
import React, { ReactNode } from 'react';
import Navbar from '@/components/navigation/Navbar';
import Sidebar from '@/components/navigation/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

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
      </div>
    </div>
  );
};

export default AppLayout;
