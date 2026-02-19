import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Crown, 
  Users, 
  MessageCircle, 
  Eye, 
  Check, 
  ArrowRight,
  Sparkles,
  Heart,
  Shield,
  Lock,
  X
} from "lucide-react";

export default function Membership() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: membershipStatus, isLoading: statusLoading } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: founders } = trpc.membership.getAllFounders.useQuery();
  const { data: innerCircleMembers } = trpc.membership.getAllInnerCircle.useQuery();

  const createCheckout = trpc.membership.createInnerCircleCheckout.useMutation({
    onSuccess: (data: { checkoutUrl: string | null }) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to checkout...");
        window.open(data.checkoutUrl, "_blank");
        setIsProcessing(false);
      }
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Failed to create checkout session");
      setIsProcessing(false);
    },
  });

  const handleJoinFree = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    setLocation("/dashboard");
  };

  const handleJoinInnerCircle = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    setIsProcessing(true);
    createCheckout.mutate();
  };

  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  // Already an Inner Circle member - show success state
  if (membershipStatus?.isInnerCircle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome, Inner Circle Member!
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Thank you for being part of the Inner Circle. You have full access to all features.
          </p>
          <Button
            onClick={() => setLocation("/dashboard")}
            size="lg"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Free features
  const freeFeatures = [
    { text: "Create a profile", included: true },
    { text: "Post stories & testimonies", included: true },
    { text: "Comment on public content", included: true },
    { text: "View public posts & discussions", included: true },
    { text: "Submit prayer requests", included: true },
    { text: "Inner Circle chat rooms", included: false },
    { text: "Post & view visions/revelations", included: false },
    { text: "Direct messaging", included: false },
    { text: "Inner Circle badge", included: false },
  ];

  // Inner Circle features
  const innerCircleFeatures = [
    { text: "Everything in Free, plus:", included: true, highlight: true },
    { text: "Inner Circle chat rooms", included: true },
    { text: "Post & view visions/revelations", included: true },
    { text: "Direct messaging with members", included: true },
    { text: "Inner Circle badge on profile", included: true },
    { text: "Weekly live fellowship calls", included: true },
    { text: "Early access to new features", included: true },
    { text: "Shape the platform's future", included: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Chosen Connect
          </h1>
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            Choose the membership that's right for your journey
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Free Tier */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 relative overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free Member</h3>
                <p className="text-white/60 mb-6">Start your journey</p>
                
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-white/60">/forever</span>
                </div>
                
                <Button
                  onClick={handleJoinFree}
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 font-semibold text-lg py-6 mb-6"
                >
                  {user ? "Go to Dashboard" : "Join Free"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <div className="space-y-3 text-left">
                  {freeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-white/30 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "text-white" : "text-white/40"}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inner Circle Tier */}
            <Card className="bg-gradient-to-br from-sky-500/20 to-blue-600/10 border-sky-500/40 relative overflow-hidden">
              {/* Badge */}
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-bold">
                  RECOMMENDED
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-sky-400" />
                  <h3 className="text-2xl font-bold text-white">Inner Circle</h3>
                </div>
                <p className="text-white/60 mb-6">Full access to the community</p>
                
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-5xl font-bold text-white">$10</span>
                  <span className="text-white/60">/month</span>
                </div>
                
                <Button
                  onClick={handleJoinInnerCircle}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-lg py-6 mb-6"
                >
                  {isProcessing ? "Processing..." : "Join Inner Circle"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <div className="space-y-3 text-left">
                  {innerCircleFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? "text-sky-400" : "text-emerald-400"}`} />
                      <span className={feature.highlight ? "text-sky-400 font-semibold" : "text-white"}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {!user && (
            <p className="mt-8 text-white/50 text-sm">
              You'll create your account when you join
            </p>
          )}
        </div>
      </section>

      {/* Why Inner Circle */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Why Join the Inner Circle?
          </h2>
          <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
            Go deeper in fellowship, prayer, and spiritual growth with believers who share your calling
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Deeper Conversations</h3>
              <p className="text-white/60 text-sm">
                Access chat rooms and direct messaging for meaningful fellowship
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Visions & Revelations</h3>
              <p className="text-white/60 text-sm">
                Share and explore what God is revealing to members of the community
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Community Support</h3>
              <p className="text-white/60 text-sm">
                Your membership helps us grow and serve more believers around the world
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Locked Content Preview */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            What You're Missing
          </h2>
          
          <div className="space-y-4">
            {[
              { icon: MessageCircle, title: "Inner Circle Chat Rooms", desc: "Join faith-focused discussions with other members" },
              { icon: Eye, title: "Visions & Revelations", desc: "Share and explore spiritual insights" },
              { icon: Users, title: "Direct Messaging", desc: "Connect one-on-one with fellow believers" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-sky-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
                <Lock className="w-5 h-5 text-white/30 flex-shrink-0" />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button
              onClick={handleJoinInnerCircle}
              disabled={isProcessing}
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold px-8"
            >
              {isProcessing ? "Processing..." : "Unlock All Features — $10/mo"}
              <Crown className="ml-2 w-5 h-5" />
            </Button>
            <p className="mt-4 text-white/40 text-sm">
              Cancel anytime · Secure payment via Stripe
            </p>
          </div>
        </div>
      </section>

      {/* Founders Wall */}
      {founders && founders.length > 0 && (
        <section className="py-16 px-4 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              <Sparkles className="w-5 h-5 inline mr-2 text-amber-400" />
              Founders Wall of Honor
            </h2>
            <p className="text-white/60 mb-8">
              Our founding members who helped build this community
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {founders.map((founder) => (
                <div
                  key={founder.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: founder.avatarBackgroundColor || "#D4AF37" }}
                  >
                    {founder.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-white font-medium">{founder.name}</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-white/40 text-sm">
            © 2025 Chosen Connect. All rights reserved.
          </p>
          <p className="text-white/30 text-xs max-w-2xl mx-auto">
            Chosen Connect is a for-profit community platform. Profits will be spent to build God's kingdom! Content is shared for fellowship and encouragement, not as professional or pastoral advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
