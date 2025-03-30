
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  BookOpen,
  Compass,
  Database,
  FileText,
  FlaskConical,
  Home,
  LayoutGrid,
  Network,
  Search,
  Settings,
  Users,
  Upload,
  AlertCircle,
  Bell,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  requireAuth?: boolean;
}

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
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

  // If on mobile, don't render the sidebar
  if (isMobile) return null;

  // Define navigation items
  const navItems: NavItem[] = [
    {
      title: "Home",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutGrid className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      title: "Browse Data",
      href: "/browse",
      icon: <Database className="h-5 w-5" />,
    },
    {
      title: "Search",
      href: "/search",
      icon: <Search className="h-5 w-5" />,
    },
    {
      title: "Research",
      href: "/research",
      icon: <FlaskConical className="h-5 w-5" />,
    },
    {
      title: "Publications",
      href: "/publications",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Upload",
      href: "/upload",
      icon: <Upload className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      title: "Community",
      href: "/community",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Tools",
      href: "/tools",
      icon: <Network className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      title: "Documentation",
      href: "/documentation",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      title: "Notifications",
      href: "/notifications",
      icon: <Bell className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      requireAuth: true,
    },
    {
      title: "Support",
      href: "/support",
      icon: <AlertCircle className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="bg-background border-r w-[240px] h-screen sticky top-0 left-0 z-30">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">ORION DB</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-4">
          <nav className="space-y-1 py-2">
            {navItems.map((item) => {
              // Skip auth-required items if not authenticated
              if (item.requireAuth && !isAuthenticated) return null;

              const isActive = location.pathname === item.href;
              return (
                <Link to={item.href} key={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start mb-1 ${
                      isActive
                        ? "bg-primary/10 hover:bg-primary/20"
                        : "hover:bg-primary/5"
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? "text-primary" : ""}`}>
                      {item.icon}
                    </span>
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 mt-auto">
          <Separator className="my-2" />
          <nav className="space-y-1 py-2">
            {bottomNavItems.map((item) => {
              // Skip auth-required items if not authenticated
              if (item.requireAuth && !isAuthenticated) return null;

              const isActive = location.pathname === item.href;
              return (
                <Link to={item.href} key={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start mb-1 ${
                      isActive
                        ? "bg-primary/10 hover:bg-primary/20"
                        : "hover:bg-primary/5"
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? "text-primary" : ""}`}>
                      {item.icon}
                    </span>
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
