import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BellRing,
  Check,
  Filter,
  Loader2,
  MailOpen,
  Search,
  Users,
  Database,
  FileText,
  Bell,
  ChevronRight,
  Info
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
  action_url: string;
}

const NotificationsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, filterCategory, filterRead, currentPage]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Build query params
      let url = `/api/users/notifications/?page=${currentPage}`;

      if (filterCategory !== "all") {
        url += `&category=${filterCategory}`;
      }

      if (filterRead !== "all") {
        url += `&is_read=${filterRead === "read" ? "true" : "false"}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      // Simulate filtering by search query (would be done on the server in a real app)
      let filtered = data.notifications;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (n: Notification) =>
            n.title.toLowerCase().includes(query) ||
            n.message.toLowerCase().includes(query)
        );
      }

      setNotifications(filtered);
      setTotalPages(data.pages);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`/api/users/notifications/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });

      // Update the UI optimistically
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );

      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));

      toast({
        title: "Notification marked as read",
        description: "Notification has been marked as read."
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read."
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/users/notifications/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });

      // Update the UI optimistically
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, is_read: true }))
      );

      // Update unread count
      setUnreadCount(0);

      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read."
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read."
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "collaboration":
        return <Users className="h-4 w-4" />;
      case "dataset":
        return <Database className="h-4 w-4" />;
      case "publication":
        return <FileText className="h-4 w-4" />;
      case "system":
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container max-w-5xl py-10">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                You need to be logged in to view notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/login")}>Log In</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-5xl py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage and view your notifications
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center">
            <BellRing className="h-5 w-5 mr-2" />
            <p className="text-sm">
              You have <strong>{unreadCount}</strong> unread notifications
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <MailOpen className="h-4 w-4 mr-2" /> Mark All as Read
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigate("/settings", { state: { activeTab: "notifications" } });
              }}
            >
              <Bell className="h-4 w-4 mr-2" /> Notification Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                      <SelectItem value="dataset">Dataset</SelectItem>
                      <SelectItem value="publication">Publication</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterRead} onValueChange={setFilterRead}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search notifications"
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          fetchNotifications();
                        }
                      }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="sm"
                  onClick={fetchNotifications}
                >
                  <Filter className="h-4 w-4 mr-2" /> Apply Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Notifications</CardTitle>
                <CardDescription>
                  {loading
                    ? "Loading notifications..."
                    : notifications.length === 0
                      ? "No notifications found"
                      : `Showing ${notifications.length} notification${notifications.length !== 1 ? "s" : ""
                      }`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <BellRing className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg">No notifications found</h3>
                    <p className="text-muted-foreground mt-1">
                      Try changing your filters or check back later.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${!notification.is_read
                            ? "bg-muted"
                            : "bg-card"
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${!notification.is_read
                                ? "bg-primary/10 text-primary"
                                : "bg-muted-foreground/10 text-muted-foreground"
                              }`}>
                              {getCategoryIcon(notification.category)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{notification.title}</h3>
                                {!notification.is_read && (
                                  <Badge variant="default" className="text-xs">New</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(notification.created_at)}
                                </span>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => navigate(notification.action_url)}
                                >
                                  View details <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Mark as read</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
