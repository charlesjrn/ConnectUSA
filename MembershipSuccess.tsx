import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, PartyPopper, ArrowRight } from "lucide-react";

export default function MembershipSuccess() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Invalidate membership status to refresh
  useEffect(() => {
    utils.membership.getStatus.invalidate();
  }, [utils]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center animate-bounce">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="w-6 h-6 text-primary" />
            <CardTitle className="text-3xl font-serif text-primary">
              Welcome, Founder!
            </CardTitle>
            <PartyPopper className="w-6 h-6 text-primary" />
          </div>
          <CardDescription className="text-lg">
            Your Founders Membership is now active
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Thank you for becoming a founding member of Chosen Connect! Your support 
            helps us build and grow this faith community. You now have access to all 
            Founder benefits.
          </p>
          
          <div className="bg-gradient-to-r from-yellow-400/10 to-amber-600/10 rounded-lg p-4 border border-yellow-400/30">
            <p className="text-sm font-medium">
              Your golden Founder badge is now visible on your profile and all your posts!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation("/membership")}
            >
              View Membership Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
