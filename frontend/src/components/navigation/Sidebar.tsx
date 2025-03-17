
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Database,
  FileText,
  Wrench,
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, toggleSidebar } = useSidebar();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const mainMenuItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: Database,
      label: "Data Browser",
      path: "/data-browser",
    },
    {
      icon: FileText,
      label: "Publications",
      path: "/publications",
    },
    {
      icon: Wrench,
      label: "Tools",
      path: "/tools",
    },
    {
      icon: Download,
      label: "Download",
      path: "/download",
    },
  ];

  const authenticatedMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      requiresAuth: true,
    },
    {
      icon: Upload,
      label: "Upload",
      path: "/upload",
      requiresAuth: true,
    },
  ];

  const resourcesMenuItems = [
    {
      icon: BookOpen,
      label: "Documentation",
      path: "/documentation",
    },
    {
      icon: Users,
      label: "Community",
      path: "/community",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      path: "/support",
    },
  ];

  return (
    <UISidebar
      className="transition-all duration-300 min-h-screen border-r"
      variant={isMobile ? "floating" : "sidebar"}
      collapsible="icon"
    >
      <SidebarHeader className="flex justify-between items-center p-2">
        {isMobile && (
          <span className={cn("font-bold text-xl", !open && "hidden")}>Menu</span>
        )}
        <SidebarTrigger onClick={toggleSidebar} className={cn("flex items-center justify-center h-7 w-7", isMobile && !open && "mx-auto")}>
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          )}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={!open ? item.label : undefined}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-5 w-5" />
                    {open && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isAuthenticated && authenticatedMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={!open ? item.label : undefined}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-5 w-5" />
                    {open && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          )}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={!open ? item.label : undefined}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-5 w-5" />
                    {open && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {isAuthenticated && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate('/settings')}
                isActive={isActive('/settings')}
                tooltip={!open ? "Settings" : undefined}
                className="flex items-center gap-2"
              >
                <Settings className="h-5 w-5" />
                {open && <span>Settings</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </UISidebar>
  );
};

export default Sidebar;
