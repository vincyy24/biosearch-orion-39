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
  Menu,
  Search,
  LogOut,
  User,
  Upload,
  Plus,
  Microscope,
  Download,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, toggleSidebar } = useSidebar();
  const { isAuthenticated, logout, user } = useAuth();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
      path: "/browse",
    },
    {
      icon: FileText,
      label: "Publications",
      path: "/publications",
    },
    {
      icon: Microscope,
      label: "Research",
      path: "/research",
    },
    {
      icon: Wrench,
      label: "Tools",
      path: "/tools",
    },
    {
      icon: Search,
      label: "Search",
      path: "/search",
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
    {
      icon: User,
      label: "Profile",
      path: "/profile",
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
      className="transition-all duration-300 min-h-screen border-r z-50"
      variant={isMobile ? "floating" : "sidebar"}
      collapsible="icon"
    >
      <SidebarHeader className="flex justify-between items-center p-2 flex-row overflow-hidden">
        {open && !isMobile && (
          <div className="flex items-center">
            <span className="font-bold text-xl">ORION</span>
          </div>
        )}
        {isMobile && open && (
          <div className="flex items-center">
            <span className="font-bold text-xl">Menu</span>
          </div>
        )}
        <SidebarTrigger onClick={toggleSidebar} className={cn(
          "flex items-center justify-center h-8 w-8 rounded-md",
          isMobile && !open && "mx-auto"
        )}>
          {isMobile ? 
            <Menu className="h-5 w-5" /> : 
            (open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />)
          }
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "transition-[opacity,height] duration-300 text-nowrap",
            open ? "opacity-100" : "opacity-0 h-0"
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

        {isAuthenticated && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(
              "transition-[opacity,height] duration-300 text-nowrap",
              open ? "opacity-100" : "opacity-0 h-0"
            )}>
              Create New
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  {open ? (
                    <div className="flex flex-col gap-2 px-2">
                      <Button 
                        size="sm" 
                        className="flex-1 h-9 py-2"
                        onClick={() => navigate('/research/new')}
                      >
                        <Microscope className="h-4 w-4 mr-1" />
                        Research
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 h-9 py-2"
                        onClick={() => navigate('/publications/new')}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Publication
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          tooltip="Create New"
                          className="flex items-center justify-center"
                        >
                          <Plus className="h-5 w-5" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={() => navigate('/research/new')}>
                          <Microscope className="h-4 w-4 mr-2" />
                          New Research
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/publications/new')}>
                          <FileText className="h-4 w-4 mr-2" />
                          New Publication
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "transition-[opacity,height] duration-300 text-nowrap",
            open ? "opacity-100" : "opacity-0 h-0"
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

      <SidebarFooter className="border-t py-2 text-nowrap overflow-hidden">
        <SidebarMenu>
          {isAuthenticated ? (
            <>
              {open && user && (
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-medium">{user.name || user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip={!open ? "Logout" : undefined}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  {open && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <div className={open ? "px-4" : "flex justify-center"}>
              <Button 
                className={cn("w-full", !open && "p-2")} 
                onClick={() => navigate('/login')}
                variant="default"
                size={open ? "default" : "icon"}
              >
                {open ? "Login" : <LogOut className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </UISidebar>
  );
};

export default Sidebar;