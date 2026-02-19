import { useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, PartyPopper, ArrowRight, Loader2 } from "lucide-react";

export default function InnerCircleSuccess() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const utils = trpc.useUtils();

  const sessionId = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("session_id") || "";
  }, [search]);

  const { data: verification, isLoading } = trpc.membership.verifySession.useQuery(
    { sessionId },
    { enabled: !!sessionId, retry: 3, retryDelay: 2000 }
  );

  // Invalidate membership status to refresh
  useEffect(() => {
    if (verification?.success) {
      utils.membership.getStatus.invalidate();
    }
  }, [verification, utils]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-white/10 border-white/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-sky-400 animate-spin mx-auto mb-4" />
            <p className="text-white/70">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!verification?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-white/10 border-white/20">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-white/70">
              We're still processing your payment. This may take a moment.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Check Again
            </Button>
            <Button
              onClick={() => setLocation("/dashboard")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 ml-2"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-gradient-to-br from-sky-500/20 to-blue-600/10 border-sky-500/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center animate-bounce">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="w-6 h-6 text-sky-400" />
            <CardTitle className="text-3xl font-serif text-white">
              Welcome to the Inner Circle!
            </CardTitle>
            <PartyPopper className="w-6 h-6 text-sky-400" />
          </div>
          <CardDescription className="text-lg text-white/70">
            Your Inner Circle membership is now active
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-white/60">
            Thank you for joining the Inner Circle! You now have full access to 
            chat rooms, visions and revelations, direct messaging, and all Inner Circle features.
          </p>
          
          <div className="bg-gradient-to-r from-sky-400/10 to-blue-600/10 rounded-lg p-4 border border-sky-400/30">
            <p className="text-sm font-medium text-white">
              Your Inner Circle badge is now visible on your profile and all your posts!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation("/membership")}
              className="border-white/30 text-white hover:bg-white/10"
            >
              View Membership Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
