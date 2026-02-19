import { ReactNode } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Lock, ArrowRight, Loader2 } from "lucide-react";

interface InnerCircleGateProps {
  children: ReactNode;
  /** Feature name to show in the locked message */
  featureName?: string;
}

/**
 * Wraps content that requires Inner Circle membership.
 * - Not logged in → prompts to sign in
 * - Free user → shows "This feature is available to Inner Circle members" with CTA
 * - Inner Circle / Founder → renders children
 */
export default function InnerCircleGate({ children, featureName = "This feature" }: InnerCircleGateProps) {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: membershipStatus, isLoading: statusLoading } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Loading state
  if (authLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full bg-white/10 border-white/20">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="w-12 h-12 text-white/40 mx-auto" />
            <h3 className="text-xl font-bold text-white">Sign In Required</h3>
            <p className="text-white/60">
              Please sign in to access this feature.
            </p>
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
            >
              Sign In
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Inner Circle or Founder member → show content
  if (membershipStatus?.isInnerCircle) {
    return <>{children}</>;
  }

  // Free user → show locked message
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-sky-500/10 to-blue-600/5 border-sky-500/30">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-sky-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Inner Circle Feature</h3>
          <p className="text-white/60">
            {featureName} is available to Inner Circle members.
          </p>
          <p className="text-white/50 text-sm">
            Join the Inner Circle for $10/month to unlock all features including chat rooms, 
            visions and revelations, direct messaging, and more.
          </p>
          <Button
            onClick={() => setLocation("/inner-circle")}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
          >
            Join Inner Circle
            <Crown className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
