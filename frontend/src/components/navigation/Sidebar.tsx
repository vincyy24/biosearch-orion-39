
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, Database, Search, BookOpen, Beaker, Users, 
  Settings, HelpCircle, Menu, LogOut, ChevronDown, 
  PlusCircle, User
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, collapsed, isActive }) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary dark:bg-primary/25"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {icon}
            {!collapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!collapsed && (
          <Link to="/" className="font-bold text-lg">
            ORION Database
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("p-0 h-8 w-8", collapsed && "mx-auto")}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-3 py-4 flex-1 overflow-auto">
        <div className="space-y-1">
          <NavItem
            to="/"
            icon={<Home className="h-5 w-5" />}
            label="Home"
            collapsed={collapsed}
            isActive={isActive('/')}
          />
          <NavItem
            to="/dashboard"
            icon={<Database className="h-5 w-5" />}
            label="Dashboard"
            collapsed={collapsed}
            isActive={isActive('/dashboard')}
          />
          <NavItem
            to="/search"
            icon={<Search className="h-5 w-5" />}
            label="Search"
            collapsed={collapsed}
            isActive={isActive('/search')}
          />
          <NavItem
            to="/browse"
            icon={<Database className="h-5 w-5" />}
            label="Data Browser"
            collapsed={collapsed}
            isActive={isActive('/browse')}
          />

          {/* Research and Publication section */}
          <div className="my-4 space-y-1">
            <NavItem
              to="/research"
              icon={<Beaker className="h-5 w-5" />}
              label="Research Projects"
              collapsed={collapsed}
              isActive={isActive('/research')}
            />
            <NavItem
              to="/publications"
              icon={<BookOpen className="h-5 w-5" />}
              label="Publications"
              collapsed={collapsed}
              isActive={isActive('/publications')}
            />
            
            {/* Create New button or dropdown */}
            {user && (
              collapsed ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full flex items-center justify-center text-muted-foreground"
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/research/new">
                        <Beaker className="h-4 w-4 mr-2" />
                        New Research
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/publications/new">
                        <BookOpen className="h-4 w-4 mr-2" />
                        New Publication
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex flex-row gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link to="/research/new">
                      <Beaker className="h-4 w-4 mr-1" />
                      New Research
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link to="/publications/new">
                      <BookOpen className="h-4 w-4 mr-1" />
                      New Publication
                    </Link>
                  </Button>
                </div>
              )
            )}
          </div>

          <NavItem
            to="/community"
            icon={<Users className="h-5 w-5" />}
            label="Community"
            collapsed={collapsed}
            isActive={isActive('/community')}
          />
          <NavItem
            to="/documentation"
            icon={<HelpCircle className="h-5 w-5" />}
            label="Documentation"
            collapsed={collapsed}
            isActive={isActive('/documentation')}
          />
        </div>
      </div>

      {/* User section at bottom */}
      <div className="p-3 border-t">
        {user ? (
          <div>
            {collapsed ? (
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 rounded-full p-0 text-muted-foreground"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account-settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/profile" className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent">
                  <span className="font-medium">{user.username}</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={logout}
                  className="w-full justify-start text-muted-foreground hover:text-current"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="default" asChild>
              <Link to="/login">Login</Link>
            </Button>
            {!collapsed && (
              <Button variant="outline" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
