import { useNavigate, useLocation } from "react-router-dom";
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
  Menu,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import * as React from "react";

const SidebarContext = React.createContext<SidebarContextValue>({});

interface SidebarContextValue {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  toggleSidebar?: () => void;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  // Add useEffect to save sidebar state to localStorage
  useEffect(() => {
    if (context.open !== undefined) {
      localStorage.setItem("sidebarState", JSON.stringify(context.open));
    }
  }, [context.open]);

  return context;
}

export const SidebarProvider = ({ children, defaultOpen = true }: SidebarProviderProps) => {
  // Check localStorage for saved state
  const savedState = typeof window !== "undefined" ? localStorage.getItem("sidebarState") : null;
  const initialState = savedState !== null ? JSON.parse(savedState) : defaultOpen;
  
  const [open, setOpen] = React.useState(initialState);
  const toggleSidebar = () => setOpen((prevOpen) => !prevOpen);

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      toggleSidebar,
    }),
    [open, setOpen, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

interface SidebarTriggerProps extends React.HTMLProps<HTMLButtonElement> {}

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={cn("p-0 transition-transform hover:bg-secondary", className)}
      {...props}
    />
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

interface SidebarProps extends React.HTMLProps<HTMLDivElement> {
  variant?: "sidebar" | "floating";
  collapsible?: "icon" | "normal";
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant = "sidebar", collapsible = "normal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex h-screen flex-col border-r bg-background data-[state=open]:shadow-xl",
          variant === "sidebar" &&
            "w-64",
          variant === "floating" &&
            "fixed inset-0 z-50 w-full translate-x-0 data-[state=closed]:translate-x-[-100%]",
          collapsible === "icon" &&
            "data-[state=collapsed]:w-[5rem]",
          className
        )}
        {...props}
      />
    );
  }
);
Sidebar.displayName = "Sidebar";

interface SidebarContentProps extends React.HTMLProps<HTMLDivElement> {}

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  SidebarContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-1 flex-col gap-2 p-2",
        className
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

interface SidebarHeaderProps extends React.HTMLProps<HTMLDivElement> {}

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  SidebarHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-16 items-center justify-between px-2",
        className
      )}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

interface SidebarFooterProps extends React.HTMLProps<HTMLDivElement> {}

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  SidebarFooterProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-16 items-center justify-between px-2",
        className
      )}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

interface SidebarMenuProps extends React.HTMLProps<HTMLUListElement> {}

export const SidebarMenu = React.forwardRef<HTMLUListElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          "flex flex-1 flex-col gap-1",
          className
        )}
        {...props}
      />
    );
  }
);
SidebarMenu.displayName = "SidebarMenu";

interface SidebarMenuItemProps extends React.HTMLProps<HTMLLIElement> {}

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  SidebarMenuItemProps
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn(
        "flex items-center",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps extends React.HTMLProps<HTMLButtonElement> {
  isActive?: boolean;
  tooltip?: string;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, tooltip, ...props }, ref) => {
  const { open } = useSidebar();

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "group relative flex w-full items-center justify-start gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-secondary data-[active]:bg-secondary/50",
        isActive && "data-[active]:bg-secondary/50",
        className
      )}
      data-active={isActive}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

interface SidebarGroupProps extends React.HTMLProps<HTMLDivElement> {}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-1",
          className
        )}
        {...props}
      />
    );
  }
);
SidebarGroup.displayName = "SidebarGroup";

interface SidebarGroupLabelProps extends React.HTMLProps<HTMLDivElement> {}

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  SidebarGroupLabelProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1 text-xs font-semibold text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

interface SidebarGroupContentProps extends React.HTMLProps<HTMLDivElement> {}

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  SidebarGroupContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-1",
        className
      )}
      {...props}
    />
  );
});
SidebarGroupContent.displayName = "SidebarGroupContent";

interface SidebarInsetProps extends React.HTMLProps<HTMLDivElement> {}

export const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          className
        )}
        {...props}
      />
    );
  }
);
SidebarInset.displayName = "SidebarInset";

const SidebarComponent = () => {
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
      icon: Search,
      label: "Search",
      path: "/search",
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
            <span className="font-bold text-xl">BiomediResearch</span>
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

export default SidebarComponent;
