
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Search,
  FileText,
  Upload,
  Database,
  BarChart,
  Users,
  BookOpen,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Microscope,
  Plus,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
    },
    {
      name: "Search",
      icon: Search,
      path: "/search",
    },
    {
      name: "Research",
      icon: Microscope,
      path: "/research",
    },
    {
      name: "Publications",
      icon: BookOpen,
      path: "/publications",
    },
    {
      name: "Upload Data",
      icon: Upload,
      path: "/upload",
    },
    {
      name: "Browse Data",
      icon: Database,
      path: "/browse",
    },
    {
      name: "Analytics",
      icon: BarChart,
      path: "/analytics",
    },
    {
      name: "Community",
      icon: Users,
      path: "/community",
    },
    {
      name: "Documentation",
      icon: FileText,
      path: "/documentation",
    },
    {
      name: "Support",
      icon: HelpCircle,
      path: "/support",
    },
  ];

  return (
    <div
      className={cn(
        "h-screen sticky top-0 flex flex-col justify-between overflow-y-auto bg-card border-r transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <Link to="/" className="text-xl font-bold">
              ORION
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("ml-auto", collapsed ? "mx-auto" : "")}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        <div className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start mb-1",
                  collapsed ? "px-2" : "px-4"
                )}
                onClick={() => {
                    navigate(item.path);
                }}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "mr-0 flex-1" : "")} />
                {!collapsed && <span>{item.name}</span>}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      <div>
        {/* Create New Button/Dropdown */}
        <div className="p-2 border-t border-b">
          {collapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full" size="icon" variant="default">
                  <Plus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/research/new")}>
                  <Microscope className="h-4 w-4 mr-2" />
                  New Research
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/publications/new")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  New Publication
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="default"
                className="flex-1 text-xs"
                onClick={() => navigate("/research/new")}
              >
                <Microscope className="h-4 w-4 mr-1" /> Research
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => navigate("/publications/new")}
              >
                <BookOpen className="h-4 w-4 mr-1" /> Publication
              </Button>
            </div>
          )}
        </div>
        {/* User Profile Section */}
        <div className="p-4 border-t mt-auto">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/profile")}
            >
              <User className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>{user?.username || user?.email}</span>}
            </Button>
          ) : (
            <Button
              variant="default"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              {collapsed ? <User className="h-5 w-5" /> : "Sign In"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
