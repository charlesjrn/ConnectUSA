import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PushNotificationSettings() {
  const { data: preferences, isLoading } = trpc.profile.getPushPreferences.useQuery();
  const updateMutation = trpc.profile.updatePushPreferences.useMutation();
  
  const [pushNotifications, setPushNotifications] = useState(true);
  const [pushComments, setPushComments] = useState(true);
  const [pushDirectMessages, setPushDirectMessages] = useState(true);
  const [pushPrayers, setPushPrayers] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (preferences) {
      setPushNotifications(preferences.pushNotifications);
      setPushComments(preferences.pushComments);
      setPushDirectMessages(preferences.pushDirectMessages);
      setPushPrayers(preferences.pushPrayers);
    }
  }, [preferences]);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("Push notifications enabled!");
        // Send a test notification
        new Notification("Chosen Connect", {
          body: "You'll now receive notifications for community activity",
          icon: "/logo.png",
        });
      } else if (result === "denied") {
        toast.error("Push notifications blocked. Please enable them in your browser settings.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to enable push notifications");
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        pushNotifications,
        pushComments,
        pushDirectMessages,
        pushPrayers,
      });
      toast.success("Push notification preferences saved!");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading preferences...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Push Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage your push notification preferences to stay updated on community activity
          </p>
        </div>

        {/* Browser Permission Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {permission === "granted" ? (
                <Bell className="w-5 h-5 text-green-600" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
              Browser Notifications
            </CardTitle>
            <CardDescription>
              {permission === "granted"
                ? "Push notifications are enabled in your browser"
                : permission === "denied"
                ? "Push notifications are blocked. Please enable them in your browser settings."
                : "Enable browser notifications to receive real-time updates"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {permission !== "granted" && permission !== "denied" && (
              <Button onClick={requestPermission} className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Enable Push Notifications
              </Button>
            )}
            {permission === "denied" && (
              <div className="text-sm text-muted-foreground">
                To enable notifications, go to your browser settings and allow notifications for this site.
              </div>
            )}
            {permission === "granted" && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Bell className="w-4 h-4" />
                Notifications enabled
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master Toggle */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <Label htmlFor="push-all" className="text-base font-semibold">
                  All Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Master switch for all push notifications
                </p>
              </div>
              <Switch
                id="push-all"
                checked={pushNotifications}
                onCheckedChange={(checked) => {
                  setPushNotifications(checked);
                  if (!checked) {
                    setPushComments(false);
                    setPushDirectMessages(false);
                    setPushPrayers(false);
                  }
                }}
              />
            </div>

            {/* Individual Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-comments">Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    When someone comments on your posts
                  </p>
                </div>
                <Switch
                  id="push-comments"
                  checked={pushComments}
                  onCheckedChange={setPushComments}
                  disabled={!pushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-messages">Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    When you receive a new message
                  </p>
                </div>
                <Switch
                  id="push-messages"
                  checked={pushDirectMessages}
                  onCheckedChange={setPushDirectMessages}
                  disabled={!pushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-prayers">Prayer Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    When someone responds to your prayer requests
                  </p>
                </div>
                <Switch
                  id="push-prayers"
                  checked={pushPrayers}
                  onCheckedChange={setPushPrayers}
                  disabled={!pushNotifications}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
