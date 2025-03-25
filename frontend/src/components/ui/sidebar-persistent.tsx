
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  SidebarTrigger as UISidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

interface SidebarContextType {
  open: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: SidebarProviderProps) {
  // Initialize state from localStorage or use default
  const [open, setOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebar-state");
    return saved !== null ? JSON.parse(saved) : defaultOpen;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("sidebar-state", JSON.stringify(open));
  }, [open]);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const setSidebarOpen = (open: boolean) => {
    setOpen(open);
  };

  return (
    <SidebarContext.Provider value={{ open, toggleSidebar, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// Custom SidebarTrigger that uses our context
export function SidebarTrigger(props: React.ComponentProps<typeof UISidebarTrigger>) {
  const { toggleSidebar } = useSidebar();
  
  return (
    <UISidebarTrigger onClick={toggleSidebar} {...props} />
  );
}

// Re-export Sidebar with our context
export function Sidebar(props: React.ComponentProps<typeof UISidebar>) {
  const { open } = useSidebar();
  
  return (
    <UISidebar data-state={open ? "expanded" : "collapsed"} {...props} />
  );
}

// Reexport components from the original sidebar
export {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset
} from "@/components/ui/sidebar";
