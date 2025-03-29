
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification
} from "@/services/notificationService";
import {
  Bell,
  Check,
  Trash2,
  AlertCircle,
  Clock,
  CheckCheck,
  Loader2,
  MessageSquare,
  Users,
  FileText,
  Lock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError("Failed to load notifications. Please try again later.");
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
      toast({
        title: "Notification marked as read",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to mark notification as read",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast({
        title: "All notifications marked as read",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to mark all notifications as read",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast({
        title: "Notification deleted",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to delete notification",
      });
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'security':
        return <Lock className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-10">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                You need to be logged in to view your notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/login")}>Log In</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Bell className="mr-2 h-5 w-5" /> Notifications
              </CardTitle>
              <CardDescription>
                Stay updated on research activities and system updates
              </CardDescription>
            </div>
            {unreadNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="hidden sm:flex"
              >
                <CheckCheck className="mr-2 h-4 w-4" /> Mark All as Read
              </Button>
            )}
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading notifications...</span>
              </div>
            ) : (
              <Tabs defaultValue="unread">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="unread">
                    Unread
                    {unreadNotifications.length > 0 && (
                      <Badge className="ml-2" variant="secondary">{unreadNotifications.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="all">All Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="unread">
                  {unreadNotifications.length > 0 ? (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {unreadNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-start gap-3 p-3 border rounded-md bg-background hover:bg-accent/5 transition-colors"
                          >
                            <div className="mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{notification.message}</p>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <h3 className="font-medium">No unread notifications</h3>
                      <p className="mt-1">All caught up! Check back later for updates.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all">
                  {notifications.length > 0 ? (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start gap-3 p-3 border rounded-md hover:bg-accent/5 transition-colors ${notification.is_read ? 'opacity-70' : 'bg-background'
                              }`}
                          >
                            <div className="mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-grow">
                              <p className={notification.is_read ? '' : 'font-medium'}>
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {format(new Date(notification.created_at), 'PPp')}
                                {notification.is_read && (
                                  <span className="ml-2 flex items-center">
                                    <Check className="h-3.5 w-3.5 mr-1" /> Read
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <h3 className="font-medium">No notifications</h3>
                      <p className="mt-1">You don't have any notifications yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {unreadNotifications.length > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4 sm:hidden"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="mr-2 h-4 w-4" /> Mark All as Read
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
