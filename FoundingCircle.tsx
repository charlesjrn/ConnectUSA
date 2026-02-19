import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Crown,
  Heart,
  MessageCircle,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function FoundingCircle() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const { user, isAuthenticated } = useAuth();

  const { data: membershipStatus } = trpc.membership.status.useQuery();
  const { data: membershipInfo, isLoading: infoLoading } = trpc.membership.info.useQuery();

  const checkoutMutation = trpc.membership.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Redirecting to checkout...");
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleJoin = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    checkoutMutation.mutate({ plan: selectedPlan });
  };

  const isMember = membershipStatus?.isMember;
  const isSoldOut = membershipInfo?.isSoldOut;
  const spotsRemaining = membershipInfo?.spotsRemaining ?? 0;
  const memberCount = membershipInfo?.memberCount ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav links={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }]} />

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Crown className="w-4 h-4" />
            Limited to {membershipInfo?.maxMembers ?? 200} Members
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            The Founding Circle
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
            Be among the first to shape Chosen Connect. Join a close-knit group of believers
            committed to deeper fellowship, prayer, and building something meaningful together.
          </p>
          {!infoLoading && !isSoldOut && spotsRemaining > 0 && (
            <p className="text-sm text-primary font-medium mt-4">
              {spotsRemaining} of {membershipInfo?.maxMembers} spots remaining
            </p>
          )}
          {isSoldOut && (
            <p className="text-sm text-destructive font-medium mt-4">
              All spots have been claimed. Join the waitlist to be notified of future openings.
            </p>
          )}
        </div>
      </section>

      {/* Already a member */}
      {isMember && (
        <section className="py-8 px-4">
          <div className="max-w-lg mx-auto bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground mb-1">You're a Founding Member</h2>
            <p className="text-sm text-muted-foreground">
              Thank you for your commitment to this community. Your support is making a real difference.
            </p>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            What You Get as a Founding Member
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="bg-primary/10 rounded-lg p-2.5 w-fit mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Private Discussion Space</h3>
              <p className="text-sm text-muted-foreground">
                Access the Founding Circle discussion area — a dedicated space for deeper
                conversations, prayer, and fellowship with fellow founding members.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="bg-primary/10 rounded-lg p-2.5 w-fit mb-4">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Monthly Live Fellowship Call</h3>
              <p className="text-sm text-muted-foreground">
                Join a monthly live group prayer and fellowship call where founding members
                connect, share testimonies, and pray together.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="bg-primary/10 rounded-lg p-2.5 w-fit mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Founding Member Badge</h3>
              <p className="text-sm text-muted-foreground">
                Receive a permanent Founding Member badge on your profile, recognizing your
                early support and commitment to the community.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="bg-primary/10 rounded-lg p-2.5 w-fit mb-4">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Shape the Community</h3>
              <p className="text-sm text-muted-foreground">
                Have a direct voice in the direction of Chosen Connect. Founding members get
                early access to new features and the ability to influence what we build next.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      {!isMember && (
        <section className="py-12 sm:py-16 px-4 bg-accent/30">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Choose the plan that works for you. Cancel anytime.
            </p>

            {/* Plan toggle */}
            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedPlan === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white text-muted-foreground border border-border hover:border-primary/30"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan("yearly")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedPlan === "yearly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white text-muted-foreground border border-border hover:border-primary/30"
                }`}
              >
                Yearly
                <span className="ml-1.5 text-xs opacity-80">Save $60</span>
              </button>
            </div>

            {/* Price card */}
            <div className="bg-white border border-border/50 rounded-2xl p-8 text-center shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Founding Circle</p>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-4xl font-bold text-foreground">
                  ${selectedPlan === "monthly" ? "15" : "120"}
                </span>
                <span className="text-muted-foreground">
                  / {selectedPlan === "monthly" ? "month" : "year"}
                </span>
              </div>
              {selectedPlan === "yearly" && (
                <p className="text-sm text-primary font-medium mb-4">
                  That's just $10/month — save $60/year
                </p>
              )}
              {selectedPlan === "monthly" && (
                <p className="text-sm text-muted-foreground mb-4">
                  Or save with the yearly plan at $120/year
                </p>
              )}

              <ul className="text-left space-y-3 mb-6">
                {[
                  "Private Founding Circle discussion space",
                  "Monthly live group prayer & fellowship call",
                  "Founding Member badge on your profile",
                  "Direct influence on community direction",
                  "Early access to all new features",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full rounded-xl text-base"
                onClick={handleJoin}
                disabled={checkoutMutation.isPending || isSoldOut}
                data-umami-event={`founding-circle-join-${selectedPlan}`}
              >
                {checkoutMutation.isPending
                  ? "Preparing checkout..."
                  : isSoldOut
                  ? "Sold Out"
                  : "Join the Founding Circle"}
                {!checkoutMutation.isPending && !isSoldOut && (
                  <ArrowRight className="w-4 h-4 ml-2" />
                )}
              </Button>

              {!user && (
                <p className="text-xs text-muted-foreground mt-3">
                  You'll need to sign in or create an account to join.
                </p>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Secure payment powered by Stripe. Cancel anytime from your account.
            </p>
          </div>
        </section>
      )}

      {/* FAQ / Trust */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Common Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-1">What happens after I join?</h3>
              <p className="text-sm text-muted-foreground">
                You'll get immediate access to the Founding Circle discussion space and be
                invited to the next monthly fellowship call. We'll send you a welcome email
                with everything you need to get started.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes. You can cancel your membership at any time. Your access will continue
                through the end of your current billing period. No questions asked.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Why is it limited to 200 members?</h3>
              <p className="text-sm text-muted-foreground">
                We want the Founding Circle to feel personal and meaningful. A smaller group
                allows for deeper connections, more meaningful conversations, and a real sense
                of community. Founding members will always hold a special place as the people
                who helped build this from the ground up.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Where does the money go?</h3>
              <p className="text-sm text-muted-foreground">
                Your membership directly supports the development and maintenance of Chosen
                Connect — keeping the platform running, building new features, and growing the
                community. We're committed to transparency about how funds are used.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Is this a replacement for church?</h3>
              <p className="text-sm text-muted-foreground">
                Not at all. Chosen Connect is designed to complement your local church, not
                replace it. Think of it as an additional space for fellowship, encouragement,
                and growth alongside believers who share your desire to serve God.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      {!isMember && (
        <section className="py-16 px-4 bg-primary/5">
          <div className="max-w-lg mx-auto text-center">
            <Users className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Ready to Join?
            </h2>
            <p className="text-muted-foreground mb-6">
              {isSoldOut
                ? "The Founding Circle is currently full. Join the waitlist to be notified when spots open up."
                : `Only ${spotsRemaining} spots left. Join the founding members who are building something meaningful together.`}
            </p>
            {isSoldOut ? (
              <Link href="/join">
                <Button size="lg" className="rounded-full px-8">
                  Join the Waitlist <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={handleJoin}
                disabled={checkoutMutation.isPending}
                data-umami-event="founding-circle-bottom-cta"
              >
                {checkoutMutation.isPending ? "Preparing..." : "Join the Founding Circle"}
                {!checkoutMutation.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
