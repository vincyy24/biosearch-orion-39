
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Filter,
  Bell,
  UserPlus,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Bookmark,
  Microscope,
  BookOpen,
  Search,
  Check,
  Trash,
} from "lucide-react";

interface Notification {
  id: string;
  type: "invitation" | "comment" | "publication" | "review" | "system" | "research";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLink?: string;
  actionText?: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockNotifications: Notification[] = [
          {
            id: "n1",
            type: "invitation",
            title: "Research Collaboration Invitation",
            message: "Dr. Jane Smith invited you to collaborate on 'Electrochemical Properties of Nanomaterials'",
            timestamp: "2023-09-15T14:30:00Z",
            read: false,
            actionLink: "/research/123",
            actionText: "View Invitation",
            sender: {
              id: "user1",
              name: "Dr. Jane Smith",
            }
          },
          {
            id: "n2",
            type: "comment",
            title: "New Comment on Your Research",
            message: "Michael Chen commented on your research 'Cyclic Voltammetry Analysis Techniques'",
            timestamp: "2023-09-14T09:45:00Z",
            read: true,
            actionLink: "/research/456#comments",
            actionText: "View Comment",
            sender: {
              id: "user2",
              name: "Michael Chen",
            }
          },
          {
            id: "n3",
            type: "publication",
            title: "Publication Cited",
            message: "Your publication 'Novel Electrochemical Sensors' was cited in a new paper",
            timestamp: "2023-09-12T17:20:00Z",
            read: false,
            actionLink: "/publications/10.1234/abc.123",
            actionText: "View Citation",
          },
          {
            id: "n4",
            type: "system",
            title: "Account Security",
            message: "Your account password was changed successfully",
            timestamp: "2023-09-10T11:15:00Z",
            read: true,
          },
          {
            id: "n5",
            type: "research",
            title: "Research Dataset Updated",
            message: "New data has been added to the project 'Impedance Spectroscopy Study'",
            timestamp: "2023-09-08T14:30:00Z",
            read: false,
            actionLink: "/research/789",
            actionText: "View Updates",
          },
          {
            id: "n6",
            type: "review",
            title: "Review Request",
            message: "You've been asked to review data for 'Electrochemical Characterization Methods'",
            timestamp: "2023-09-05T09:10:00Z",
            read: true,
            actionLink: "/review/123",
            actionText: "Review Data",
            sender: {
              id: "user3",
              name: "Dr. Sarah Johnson",
            }
          },
          {
            id: "n7",
            type: "publication",
            title: "Publication Approved",
            message: "Your publication 'Advances in Nanomaterials' has been approved and is now public",
            timestamp: "2023-09-01T15:45:00Z",
            read: true,
            actionLink: "/publications/10.5678/def.456",
            actionText: "View Publication",
          },
        ];
        
        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  useEffect(() => {
    let filtered = [...notifications];
    
    // Apply tab filter
    if (activeTab !== "all") {
      if (activeTab === "unread") {
        filtered = filtered.filter(n => !n.read);
      } else {
        filtered = filtered.filter(n => n.type === activeTab);
      }
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        n => n.title.toLowerCase().includes(query) || 
             n.message.toLowerCase().includes(query) ||
             (n.sender && n.sender.name.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, activeTab, searchQuery, sortBy]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "invitation":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "publication":
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      case "review":
        return <FileText className="h-5 w-5 text-orange-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-gray-500" />;
      case "research":
        return <Microscope className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationCount = (type: string) => {
    if (type === "all") return notifications.length;
    if (type === "unread") return notifications.filter(n => !n.read).length;
    return notifications.filter(n => n.type === type).length;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with activity on your research and publications
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" /> Mark All Read
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="all" className="flex-1">
              All
              <Badge variant="secondary" className="ml-2">{getNotificationCount("all")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread
              <Badge variant="secondary" className="ml-2">{getNotificationCount("unread")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="invitation" className="flex-1">Invitations</TabsTrigger>
            <TabsTrigger value="publication" className="flex-1">Publications</TabsTrigger>
            <TabsTrigger value="research" className="flex-1">Research</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex p-4 gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-lg">No notifications found</p>
                {activeTab !== "all" && (
                  <Button variant="link" onClick={() => setActiveTab("all")}>
                    View all notifications
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`overflow-hidden ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
              >
                <CardContent className="p-0">
                  <div className="flex p-4 gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {renderIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{notification.title}</h3>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(notification.timestamp), "MMM d, yyyy")}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      {notification.sender && (
                        <p className="text-xs text-muted-foreground mt-2">
                          From: {notification.sender.name}
                        </p>
                      )}
                      <div className="mt-3 flex justify-between items-center">
                        {notification.actionLink && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            {notification.actionText || "View"}
                          </Button>
                        )}
                        <div className="flex gap-2">
                          {!notification.read ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Mark as read</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-muted-foreground"
                              disabled
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Read</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 text-destructive hover:text-destructive/80"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete notification</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
