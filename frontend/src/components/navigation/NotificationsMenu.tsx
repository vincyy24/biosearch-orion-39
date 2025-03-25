
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

const NotificationsMenu = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "New Publication Citation",
      message: "Your publication 'Novel Electrochemical Methods' was cited in a new paper.",
      time: "2 hours ago",
      read: false,
      type: "info",
    },
    {
      id: "2",
      title: "Data Download Complete",
      message: "Your requested dataset has been prepared and is ready for download.",
      time: "1 day ago",
      read: true,
      type: "success",
    },
    {
      id: "3",
      title: "Upload Review",
      message: "Your recent data upload is being reviewed by our team.",
      time: "3 days ago",
      read: true,
      type: "info",
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const getTypeStyles = (type: NotificationItem["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
      case "success":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
      case "error":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-xs text-white flex items-center justify-center transform translate-x-1 -translate-y-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex justify-between items-center">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" onClick={markAllAsRead} className="h-auto p-0">
              Mark all as read
            </Button>
          )}
        </div>
        
        {notifications.length > 0 ? (
          <ScrollArea className="h-80">
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b last:border-b-0 cursor-pointer",
                    !notification.read && getTypeStyles(notification.type),
                    !notification.read && "font-medium"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No new notifications
          </div>
        )}
        
        <div className="p-2 border-t">
          <Button variant="outline" size="sm" className="w-full">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsMenu;
