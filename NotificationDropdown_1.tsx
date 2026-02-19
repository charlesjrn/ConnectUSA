import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, MessageCircle, MessageSquare, X } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: notifications, isLoading } = trpc.notifications.getAll.useQuery({ limit: 20 });
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getAll.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getAll.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ notificationId: notification.id });
    }
    if (notification.relatedUrl) {
      setLocation(notification.relatedUrl);
    }
    onClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
      case "reply":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "direct_message":
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case "new_post":
        return <Bell className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-96 max-h-[500px] overflow-hidden shadow-lg rounded-lg border border-border bg-background z-50"
    >
      <Card className="border-0">
        <CardHeader className="border-b border-border flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
          <div className="flex items-center gap-2">
            {notifications && notifications.some((n) => !n.isRead) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                    !notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
