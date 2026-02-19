import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Heart, Users, BookOpen, MessageCircle, Sparkles, ArrowRight, Mail, CheckCircle } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subscribeMutation = trpc.subscribe.join.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      if (data.alreadySubscribed) {
        toast.success("You're already on the list! We'll keep you posted.");
      } else {
        toast.success("Welcome! We'll notify you when Chosen Connect launches.");
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

  // If logged in, redirect to dashboard
  if (user && !loading) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Chosen Connect
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/join">
              <Button size="sm" className="rounded-full">Join the Waitlist</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Coming Soon
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground mb-6">
            A public gathering place for Christians called by God to spread His Word and bring people to Christ.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect, share your gifts, and grow with others walking the same path.
          </p>

          {/* Email Capture */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl bg-white border-border/60 text-foreground placeholder:text-muted-foreground"
              />
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-white border-border/60 text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold"
                disabled={subscribeMutation.isPending}
                data-umami-event="hero-join-waitlist"
              >
                {subscribeMutation.isPending ? "Joining..." : "Join Free — Coming Soon"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {countData && countData.count > 0 && (
                <p className="text-sm text-muted-foreground">
                  {countData.count} {countData.count === 1 ? "person has" : "people have"} already joined
                </p>
              )}
            </form>
          ) : (
            <div className="max-w-md mx-auto bg-primary/5 border border-primary/20 rounded-xl p-6">
              <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">You're on the list!</p>
              <p className="text-muted-foreground mt-1">We'll let you know when Chosen Connect is ready.</p>
            </div>
          )}
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Chosen Connect is a community built for believers who feel called to something greater.
            We create a space where Christians can share their spiritual gifts, encourage one another,
            and grow together in fellowship and discernment — without the noise of mainstream social media.
          </p>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">Who Is This For?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
              <Heart className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Called Believers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Christians who sense a deeper calling and want to walk in their purpose alongside others who understand.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Fellowship Seekers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Believers looking for authentic community — a place to share testimonies, prayer requests, and encouragement.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
              <BookOpen className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Gift Discerners</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Those seeking to discover, develop, and share their spiritual gifts in a safe, supportive environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Coming */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-3">What's Coming</h2>
          <p className="text-center text-muted-foreground mb-10">Features we're building for you</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Users, title: "Member Profiles", desc: "Share your story, gifts, and calling with the community" },
              { icon: MessageCircle, title: "Group Discussions", desc: "Faith-centered conversations in a safe, moderated space" },
              { icon: Heart, title: "Prayer Rooms", desc: "Submit and pray over requests together in real time" },
              { icon: BookOpen, title: "Resources & Devotionals", desc: "Curated content to help you grow in your walk" },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-5 border border-border/50 shadow-sm">
                <div className="bg-primary/10 rounded-lg p-2.5 shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture Quote */}
      <section className="py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-lg sm:text-xl italic text-muted-foreground leading-relaxed">
            "You did not choose me, but I chose you and appointed you so that you might go and bear fruit — fruit that will last."
          </blockquote>
          <p className="mt-3 text-sm font-semibold text-primary">— John 15:16</p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-lg mx-auto text-center">
          <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Be the First to Know</h2>
          <p className="text-muted-foreground mb-6">
            Join the waitlist and get early access when we launch. Early members will receive founding access and special pricing.
          </p>
          <Link href="/join">
            <Button size="lg" className="rounded-full px-8" data-umami-event="bottom-cta-join">
              Join the Waitlist <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <p className="text-sm font-semibold text-foreground">Chosen Connect</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/join" className="hover:text-foreground transition-colors">Join</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Chosen Connect is a for-profit community platform. Profits will be spent to build God's kingdom!</p>
            <p>Content is shared for fellowship and encouragement, not as professional or pastoral advice.</p>
            <p className="mt-2">&copy; {new Date().getFullYear()} Chosen Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
