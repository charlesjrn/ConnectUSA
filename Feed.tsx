import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Home, LogOut, Sparkles, User, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function Feed() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: posts, isLoading: postsLoading } = trpc.posts.list.useQuery();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      gift: "bg-blue-500/20 text-blue-300 border-blue-500/50",
      vision: "bg-purple-500/20 text-purple-300 border-purple-500/50",
      encounter: "bg-green-500/20 text-green-300 border-green-500/50",
      testimony: "bg-primary/20 text-primary border-primary/50",
      prayer: "bg-pink-500/20 text-pink-300 border-pink-500/50",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Chosen Connect
            </h1>
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => setLocation("/feed")}>
                Feed
              </Button>
              <Button variant="ghost" onClick={() => setLocation(`/profile/${user.id}`)}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.name || user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                setLocation("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Community Feed</h2>
          <p className="text-muted-foreground">
            Explore the spiritual experiences shared by our community members.
          </p>
        </div>

        {postsLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading posts...</div>
          </div>
        ) : !posts || posts.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No posts yet. Be the first to share your experience!
              </p>
              <Button onClick={() => setLocation("/dashboard")} className="bg-primary text-primary-foreground">
                Share Your Story
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(post.category)}>
                          {post.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.userName || post.userEmail || "Anonymous"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
