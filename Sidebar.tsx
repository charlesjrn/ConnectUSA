import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Sparkles, ScrollText, Eye, Flame, Target, Users, MessageCircle, User, LogOut, UserSearch, HandHeart, BarChart3, Video, UserCheck, Settings, Bell, Church, ExternalLink, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const NAVIGATION_ITEMS = [
  { id: "feed", label: "Feed", icon: Home, path: "/dashboard" },
  { id: "gifts", label: "Gifts", icon: Sparkles, path: "/gifts" },
  { id: "revelations", label: "Revelations", icon: ScrollText, path: "/revelations" },
  { id: "visions", label: "Visions", icon: Eye, path: "/visions" },
  { id: "encounters", label: "Encounters", icon: Flame, path: "/encounters" },
  { id: "missions", label: "Missions", icon: Target, path: "/missions" },
  { id: "prayer-requests", label: "Prayer Requests", icon: HandHeart, path: "/prayer-requests" },
  { id: "prayer-room", label: "🙏 Live Prayer Room", icon: Church, path: "/prayer-room" },
  { id: "meetups", label: "Meetups", icon: Users, path: "/meetups" },
  { id: "video-chat", label: "Video Chat", icon: Video, path: "/video-chat" },
  { id: "video-prayer", label: "1:1 Video Prayer", icon: Heart, path: "/video-prayer" },
  { id: "members", label: "Members", icon: UserSearch, path: "/members" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
  { id: "messages", label: "Direct Messages", icon: MessageCircle, path: "/messages" },
] as const;

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Check if user is the owner via backend
  const { data: ownerCheck } = trpc.auth.isOwner.useQuery(undefined, {
    enabled: !!user,
  });
  const isOwner = ownerCheck?.isOwner ?? false;

  const handleNavigation = (path: string) => {
    setLocation(path);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-[#F5F3E8]">
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <div className="flex-1 py-6 overflow-y-auto">
            {NAVIGATION_ITEMS.map((item) => {
              // Hide analytics for non-owners
              if (item.id === "analytics" && !isOwner) {
                return null;
              }
              
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-[#E8E5D3] text-gray-900"
                      : "text-gray-700 hover:bg-[#EEEBD8]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-base">{item.label}</span>
                </button>
              );
            })}

            {/* Divider */}
            <div className="my-4 border-t border-gray-300" />

            {/* My Profile */}
            <button
              onClick={() => handleNavigation("/profile")}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                location === "/profile"
                  ? "bg-[#E8E5D3] text-gray-900"
                  : "text-gray-700 hover:bg-[#EEEBD8]"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-base">My Profile</span>
            </button>

            {/* Email Preferences */}
            <button
              onClick={() => handleNavigation("/settings/email-preferences")}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                location === "/settings/email-preferences"
                  ? "bg-[#E8E5D3] text-gray-900"
                  : "text-gray-700 hover:bg-[#EEEBD8]"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-base">Email Preferences</span>
            </button>

            {/* Push Notifications */}
            <button
              onClick={() => handleNavigation("/settings/push-notifications")}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                location === "/settings/push-notifications"
                  ? "bg-[#E8E5D3] text-gray-900"
                  : "text-gray-700 hover:bg-[#EEEBD8]"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="text-base">Push Notifications</span>
            </button>

            {/* Invite Friends */}
            <button
              onClick={() => handleNavigation("/referrals")}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                location === "/referrals"
                  ? "bg-[#E8E5D3] text-gray-900"
                  : "text-gray-700 hover:bg-[#EEEBD8]"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-base">Invite Friends</span>
            </button>

            {/* Discord Community */}
            <a
              href="https://discord.gg/chosenconnect"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-6 py-3 text-left text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="text-base">Discord Community</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </a>

            {/* Sign Out */}
            <button
              onClick={() => {
                logout();
                onOpenChange(false);
              }}
              className="w-full flex items-center gap-3 px-6 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-base">Sign Out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
