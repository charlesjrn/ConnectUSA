import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, CheckCircle, Mail, Star, Users, Heart } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function Join() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subscribeMutation = trpc.subscribe.join.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      if (data.alreadySubscribed) {
        toast.success("You're already on the list! We'll keep you posted.");
      } else {
        toast.success("Welcome! You're on the founding members waitlist.");
      }
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const { data: countData } = trpc.subscribe.count.useQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email, name: name || undefined });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav links={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }]} />

      {/* Main Content */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Join the Waitlist
            </h1>
            <p className="text-lg text-muted-foreground">
              Be among the first to experience Chosen Connect when we launch.
            </p>
          </div>

          {!submitted ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                    Your Name <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="First name or full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-white border-border/60"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-white border-border/60"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  disabled={subscribeMutation.isPending}
                  data-umami-event="join-page-signup"
                >
                  {subscribeMutation.isPending ? "Joining..." : "Join Free – Early Access"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              {countData && countData.count > 0 && (
                <p className="text-center text-sm text-muted-foreground mb-8">
                  {countData.count} {countData.count === 1 ? "person has" : "people have"} already joined
                </p>
              )}

              {/* What you get */}
              <div className="bg-accent/40 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-foreground text-center mb-4">What Early Members Get</h3>
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Founding Access</p>
                    <p className="text-xs text-muted-foreground">Be the first to join when we open the doors</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Special Pricing</p>
                    <p className="text-xs text-muted-foreground">Early supporters will receive the best rates, always</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Shape the Community</p>
                    <p className="text-xs text-muted-foreground">Help us build the features and culture that matter most</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                We respect your privacy. No spam, ever. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 mb-6">
                <CheckCircle className="w-14 h-14 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">You're on the founding members waitlist.</h2>
                <p className="text-muted-foreground">
                  Thank you for joining. We'll send you an email as soon as Chosen Connect is ready.
                  Early members will get founding access and special pricing.
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" className="rounded-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
