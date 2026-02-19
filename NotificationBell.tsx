import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Fetch notifications and unread count
  const { data: notifications = [] } = trpc.notifications.getAll.useQuery(
    { limit: 10 },
    { refetchInterval: 10000 } // Refresh every 10 seconds
  );

  const { data: unreadCount = 0 } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getAll.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getAll.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead.mutate({ notificationId: notification.id });
    }
    if (notification.relatedUrl) {
      setLocation(notification.relatedUrl);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              className="text-xs text-primary hover:text-primary/80"
            >
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            No notifications yet
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-3 cursor-pointer flex flex-col items-start gap-1 ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
