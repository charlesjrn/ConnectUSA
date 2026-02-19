import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { 
  MessageCircle, 
  Eye, 
  Heart, 
  Calendar, 
  Users, 
  BookOpen,
  ArrowRight,
  Crown,
  Sparkles,
  ExternalLink,
  Lock,
  Home,
  ScrollText,
  Flame,
  Target,
  UserSearch,
  HandHeart,
  BarChart3,
  Video,
  Church,
  User,
  LogOut,
  Settings,
  Bell,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
  { id: "feed", label: "Feed", icon: MessageCircle, path: "/feed" },
  { id: "gifts", label: "Gifts", icon: Sparkles, path: "/gifts" },
  { id: "revelations", label: "Revelations", icon: ScrollText, path: "/revelations" },
  { id: "visions", label: "Visions", icon: Eye, path: "/visions" },
  { id: "encounters", label: "Encounters", icon: Flame, path: "/encounters" },
  { id: "missions", label: "Missions", icon: Target, path: "/missions" },
  { id: "prayer-requests", label: "Prayer Requests", icon: HandHeart, path: "/prayer-requests" },
  { id: "prayer-room", label: "Live Prayer Room", icon: Church, path: "/prayer-room" },
  { id: "video-prayer", label: "1:1 Video Prayer", icon: Heart, path: "/video-prayer" },
  { id: "meetups", label: "Meetups", icon: Users, path: "/meetups" },
  { id: "video-chat", label: "Video Chat", icon: Video, path: "/video-chat" },
  { id: "members", label: "Members", icon: UserSearch, path: "/members" },
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
  { id: "messages", label: "Direct Messages", icon: MessageCircle, path: "/messages" },
];

const SETTINGS_ITEMS = [
  { id: "profile", label: "My Profile", icon: User, path: "/profile" },
  { id: "email-prefs", label: "Email Preferences", icon: Settings, path: "/settings/email-preferences" },
  { id: "push-notifs", label: "Push Notifications", icon: Bell, path: "/settings/push-notifications" },
  { id: "referrals", label: "Invite Friends", icon: Users, path: "/referrals" },
];

export default function MemberDashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: membershipStatus, isLoading: membershipLoading } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: ownerCheck } = trpc.auth.isOwner.useQuery(undefined, {
    enabled: !!user,
  });
  const isOwner = ownerCheck?.isOwner ?? false;
  const isFounder = membershipStatus?.isFounder;

  if (loading || membershipLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const quickLinks = [
    {
      title: "Submit Testimony",
      description: "Share your encounter with God",
      icon: MessageCircle,
      href: "/submit-testimony",
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-400",
      founderOnly: false
    },
    {
      title: "Submit Vision",
      description: "Share revelations and visions",
      icon: Eye,
      href: "/submit-vision",
      color: "from-amber-500/20 to-amber-600/20",
      iconColor: "text-amber-400",
      founderOnly: false
    },
    {
      title: "Prayer Requests",
      description: "Request and offer prayers",
      icon: Heart,
      href: "/prayer-requests",
      color: "from-rose-500/20 to-rose-600/20",
      iconColor: "text-rose-400",
      founderOnly: false
    },
    {
      title: "1:1 Video Prayer",
      description: "Pray face-to-face with a partner",
      icon: Video,
      href: "/video-prayer",
      color: "from-sky-500/20 to-sky-600/20",
      iconColor: "text-sky-400",
      founderOnly: false
    },
    {
      title: "Live Events",
      description: "Upcoming gatherings",
      icon: Calendar,
      href: "/events",
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-400",
      founderOnly: true
    },
    {
      title: "Resources",
      description: "Devotionals & guides",
      icon: BookOpen,
      href: "/resources",
      color: "from-indigo-500/20 to-indigo-600/20",
      iconColor: "text-indigo-400",
      founderOnly: false
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663276675485/NYRoGrjvnCQVbZEX.png" 
            alt="Chosen Connect" 
            className="h-8 w-auto"
          />
          <span className="text-white font-semibold text-sm">Chosen Connect</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Community</span>
        </div>
        {NAVIGATION_ITEMS.map((item) => {
          if (item.id === "analytics" && !isOwner) return null;
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <button
              key={item.id}
              onClick={() => {
                setLocation(item.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white border-l-2 border-sky-400"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80 border-l-2 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {isOwner && (
          <button
            onClick={() => {
              setLocation("/analytics");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
              location === "/analytics"
                ? "bg-white/10 text-white border-l-2 border-sky-400"
                : "text-white/60 hover:bg-white/5 hover:text-white/80 border-l-2 border-transparent"
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Analytics</span>
          </button>
        )}

        <div className="my-3 mx-4 border-t border-white/10" />

        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Settings</span>
        </div>
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <button
              key={item.id}
              onClick={() => {
                setLocation(item.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white border-l-2 border-sky-400"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80 border-l-2 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Discord */}
        <a
          href="https://discord.gg/chosenconnect"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-indigo-400 hover:bg-indigo-500/10 transition-colors border-l-2 border-transparent"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span>Discord Community</span>
        </a>
      </nav>

      {/* User section at bottom */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <User className="w-4 h-4 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{user.name || "Member"}</p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex">
      {/* Desktop Sidebar - always visible on lg+ */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#0d1117] border-r border-white/10 fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0d1117] border-r border-white/10 z-50">
            <div className="absolute top-3 right-3">
              <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header with hamburger */}
        <header className="lg:hidden sticky top-0 z-30 border-b border-white/10 bg-[#0d1117]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setMobileMenuOpen(true)} className="text-white/70 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663276675485/NYRoGrjvnCQVbZEX.png" 
                alt="Chosen Connect" 
                className="h-8 w-auto"
              />
              <span className="text-white font-semibold">Chosen Connect</span>
            </div>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:block border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Member Dashboard</h1>
              <p className="text-sm text-white/50">Welcome back, {user.name || "Member"}</p>
            </div>
            <div className="flex items-center gap-4">
              {isFounder ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-sm font-medium">Founder</span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/membership")}
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <section className="py-10 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white/70 text-sm">Welcome back, {user.name || "Member"}</span>
            </div>
            
            {/* Mobile-only founder badge */}
            <div className="lg:hidden mb-4">
              {isFounder ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-sm font-medium">Founding Member</span>
                </div>
              ) : (
                <Button
                  onClick={() => setLocation("/membership")}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Become a Founder
                </Button>
              )}
            </div>

            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {isFounder 
                ? "Your space to connect, share, and grow with the Chosen Connect community."
                : "Welcome to your dashboard. Upgrade to Founder to unlock all features."
              }
            </p>
          </div>
        </section>

        {/* Quick Links Grid */}
        <section className="py-6 px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-6 px-2">Quick Actions</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((link, index) => {
                const isLocked = link.founderOnly && !isFounder;
                
                return (
                  <Card 
                    key={index}
                    className={`bg-gradient-to-br ${link.color} border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group ${isLocked ? 'opacity-60' : ''}`}
                    onClick={() => {
                      if (isLocked) {
                        setLocation("/membership");
                        return;
                      }
                      setLocation(link.href);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                          <link.icon className={`w-6 h-6 ${link.iconColor}`} />
                        </div>
                        {isLocked && (
                          <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                            <Lock className="w-3 h-3" />
                            <span>Founder</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{link.title}</h3>
                      <p className="text-white/60 text-sm">{link.description}</p>
                      {!isLocked && (
                        <div className="mt-4 flex items-center text-white/50 group-hover:text-white/70 transition-colors">
                          <span className="text-sm">Go to {link.title.toLowerCase()}</span>
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                      {isLocked && (
                        <div className="mt-4 flex items-center text-amber-400/70">
                          <span className="text-sm">Upgrade to unlock</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Community Feed Preview */}
        <section className="py-6 px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-semibold text-white">Community Feed</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/feed")}
                className="text-amber-400 hover:text-amber-300"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Community Feed</h3>
                <p className="text-white/60 mb-4">
                  View testimonies, visions, and prayer requests from the community
                </p>
                <Button
                  onClick={() => setLocation("/feed")}
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  Browse Community Feed
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-white/10 mt-8">
          <div className="max-w-6xl mx-auto text-center space-y-4">
            <p className="text-white/40 text-sm">
              © 2024 Chosen Connect. All rights reserved.
            </p>
            <p className="text-white/30 text-xs max-w-2xl mx-auto">
              Chosen Connect is a for-profit community platform. Profits will be spent to build God's kingdom! Content is shared for fellowship and encouragement, not as professional or pastoral advice.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
