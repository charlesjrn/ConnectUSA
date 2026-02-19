import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Search, Users, Map } from "lucide-react";
import { ActivityIndicator } from "@/components/ActivityIndicator";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Members() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: members, isLoading } = trpc.members.search.useQuery({
    searchTerm: searchTerm.trim(),
    limit: 100,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Member Directory</h1>
          </div>
          <p className="text-muted-foreground">
            Connect with other believers in the community
          </p>
          <Button
            variant="outline"
            onClick={() => setLocation("/members-map")}
            className="mt-4 flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            Map View
          </Button>
        </div>

        {/* Guest Banner */}
        {!user && (
          <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
            <h3 className="text-xl font-bold text-yellow-900 mb-2">👋 Join to Connect!</h3>
            <p className="text-yellow-800 mb-4">
              Sign in to view full member profiles and connect with the community.
            </p>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-[#d4a017] hover:bg-[#b8900f] text-black font-semibold"
            >
              Join the Community
            </Button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search members by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        {/* Members Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        ) : members && members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card
                key={member.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/user/${member.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar with Activity Indicator */}
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {getInitials(member.name || "Anonymous")}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-0">
                        <ActivityIndicator lastSeen={member.createdAt} size="md" />
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {member.name || "Anonymous"}
                    </h3>

                    {/* Bio Preview */}
                    {member.bio && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {member.bio}
                      </p>
                    )}

                    {/* Spiritual Gifts */}
                    {member.spiritualGifts && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Spiritual Gifts:</p>
                        <p className="text-sm text-foreground line-clamp-1">
                          {member.spiritualGifts}
                        </p>
                      </div>
                    )}

                    {/* Chosen Date */}
                    {member.chosenDate && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground">Chosen Date:</p>
                        <p className="text-sm text-primary font-medium">
                          {formatDate(member.chosenDate)}
                        </p>
                      </div>
                    )}

                    {/* View Profile Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/user/${member.id}`);
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No members found matching your search." : "No members yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
