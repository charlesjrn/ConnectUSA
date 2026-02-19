import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Heart, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function MyPrayers() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: myPrayers, isLoading } = trpc.messages.getMyPrayers.useQuery(undefined, {
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">My Prayer History</h1>
          <p className="text-amber-700">Prayer requests you've committed to pray for</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your prayer history...</p>
          </div>
        ) : !myPrayers || myPrayers.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-2">No prayers yet</p>
            <p className="text-muted-foreground mb-6">
              Start praying for others by visiting the Prayer Requests page
            </p>
            <Button onClick={() => setLocation("/prayer-requests")}>
              View Prayer Requests
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {myPrayers.map((prayer: any) => (
              <Card
                key={prayer.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  prayer.isAnswered ? "border-green-300 bg-green-50" : ""
                }`}
                onClick={() => setLocation(`/testimony/${prayer.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {prayer.isAnswered && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {prayer.isUrgent && (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                            URGENT
                          </span>
                        )}
                        {prayer.category && (
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded capitalize">
                            {prayer.category}
                          </span>
                        )}
                      </div>

                      {prayer.title && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {prayer.title}
                        </h3>
                      )}

                      <p className="text-gray-700 mb-3 whitespace-pre-wrap line-clamp-3">
                        {prayer.content}
                      </p>

                      {prayer.isAnswered && prayer.answeredTestimony && (
                        <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
                          <p className="text-sm font-semibold text-green-900 mb-1">
                            ✨ Prayer Answered!
                          </p>
                          <p className="text-sm text-green-800 whitespace-pre-wrap line-clamp-2">
                            {prayer.answeredTestimony}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>
                          By {prayer.isAnonymous ? "Anonymous" : prayer.userName}
                        </span>
                        <span>•</span>
                        <span>{new Date(prayer.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {prayer.prayerCount || 0} praying
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
