
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Check,
  Filter,
  Loader2,
  Settings,
  Users,
  FileText,
  Database,
  Info,
  AlertTriangle,
  Trash2
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  category: 'collaboration' | 'publication' | 'dataset' | 'research' | 'system';
  is_read: boolean;
  created_at: string;
  action_url: string;
}

interface NotificationsResponse {
  count: number;
  pages: number;
  current_page: number;
  notifications: Notification[];
  unread_count: number;
}

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}> = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'collaboration':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'publication':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'dataset':
        return <Database className="h-5 w-5 text-green-500" />;
      case 'research':
        return <FileText className="h-5 w-5 text-amber-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  const formattedDate = new Date(notification.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };
  
  return (
    <div 
      className={`flex gap-4 p-4 border-b cursor-pointer transition-colors ${
        notification.is_read ? 'bg-background' : 'bg-primary/5'
      } hover:bg-muted/50`}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-1">
        {getCategoryIcon(notification.category)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className={`text-base ${!notification.is_read ? 'font-semibold' : ''}`}>
            {notification.title}
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
            {!notification.is_read && (
              <div className="h-2 w-2 bg-primary rounded-full"></div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        <div className="flex items-center mt-2">
          <Badge variant="outline" className="mr-2">
            {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
          </Badge>
          {notification.action_url && (
            <span className="text-xs text-primary cursor-pointer hover:underline">
              View details
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { 
        replace: true, 
        state: { from: { pathname: "/notifications" } } 
      });
    }
    
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, authLoading, navigate, page, activeTab, categoryFilter]);
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create sample notifications data
      const mockData: NotificationsResponse = {
        count: 10,
        pages: 2,
        current_page: page,
        unread_count: 3,
        notifications: [
          {
            id: 1,
            title: 'New collaboration invitation',
            message: 'You have been invited to collaborate on the project "Electrochemical Sensors for Glucose Detection"',
            category: 'collaboration',
            is_read: false,
            created_at: '2023-11-15T10:30:00Z',
            action_url: '/research/RP-12345ABC',
          },
          {
            id: 2,
            title: 'Publication cited',
            message: 'Your publication "Novel Electrochemical Methods" has been cited in a new paper',
            category: 'publication',
            is_read: true,
            created_at: '2023-11-14T15:45:00Z',
            action_url: '/publications/10.1021/jacs.0c01234',
          },
          {
            id: 3,
            title: 'Dataset downloaded',
            message: 'Your dataset "Cyclic Voltammetry Data" has been downloaded 10 times this week',
            category: 'dataset',
            is_read: false,
            created_at: '2023-11-13T09:15:00Z',
            action_url: '/datasets/DS-54321ZYX',
          },
          {
            id: 4,
            title: 'Research project update',
            message: 'John Doe made changes to the research project "Advanced Materials for Fuel Cells"',
            category: 'research',
            is_read: true,
            created_at: '2023-11-12T14:20:00Z',
            action_url: '/research/RP-13579GHI',
          },
          {
            id: 5,
            title: 'System update',
            message: 'New features have been added to the platform: Improved analytics and data visualization',
            category: 'system',
            is_read: false,
            created_at: '2023-11-10T11:00:00Z',
            action_url: '/whatsnew',
          },
        ]
      };
      
      // Filter based on activeTab
      let filteredNotifications = [...mockData.notifications];
      
      if (activeTab === 'unread') {
        filteredNotifications = filteredNotifications.filter(n => !n.is_read);
      }
      
      if (categoryFilter) {
        filteredNotifications = filteredNotifications.filter(n => n.category === categoryFilter);
      }
      
      setNotifications(filteredNotifications);
      setUnreadCount(mockData.unread_count);
      setTotalPages(mockData.pages);
      setTotalCount(mockData.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: "destructive",
        title: "Failed to load notifications",
        description: "There was an error loading your notifications. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: number) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(prev - 1, 0));
      
      // Show success toast
      toast({
        title: "Notification marked as read",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "There was an error marking the notification as read."
      });
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
      
      // Show success toast
      toast({
        title: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "There was an error marking all notifications as read."
      });
    }
  };
  
  if (authLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Loading your notifications...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  if (!isAuthenticated) {
    return null; // The useEffect will redirect to login
  }
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated on your research activities and collaborations
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2">
                <Select 
                  value={categoryFilter || ''} 
                  onValueChange={(value) => setCategoryFilter(value || null)}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="publication">Publication</SelectItem>
                    <SelectItem value="dataset">Dataset</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notifications.length > 0 ? (
              <div>
                {notifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-muted-foreground mt-1">
                  {activeTab === 'unread' 
                    ? "You've read all your notifications." 
                    : categoryFilter 
                      ? `No ${categoryFilter} notifications found.` 
                      : "You don't have any notifications yet."}
                </p>
              </div>
            )}
          </CardContent>
          
          {totalPages > 1 && (
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default Notifications;
