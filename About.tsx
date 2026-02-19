import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Chosen Connect
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/join">
              <Button size="sm" className="rounded-full">Join the Waitlist</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            About Chosen Connect
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A community born from a simple truth: walking in your calling is easier when you're not walking alone.
          </p>
        </div>
      </section>

      {/* The Story */}
      <section className="py-12 px-4 bg-accent/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">The Story Behind Chosen Connect</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Chosen Connect started with a personal experience that many believers share but rarely talk about:
              the feeling of being called by God, yet struggling to find others who truly understand that journey.
            </p>
            <p>
              Churches are wonderful, but they can be large and busy. Social media is noisy and often pulls us
              away from what matters. Small groups help, but they don't always go deep enough into the spiritual
              gifts, visions, and encounters that shape our walks with God.
            </p>
            <p>
              We wanted to build something different &mdash; a dedicated space where believers who know they are
              called can come together, share openly, and grow in community. Not a replacement for church, but a
              companion to it. A place where your testimony is celebrated, your prayer requests are lifted up, and
              your spiritual gifts are encouraged.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">The Problem We're Solving</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Many Christians who experience a deeper calling &mdash; whether through spiritual gifts, prophetic
              dreams, healing, or a strong sense of divine purpose &mdash; often feel isolated. They may not have
              anyone in their immediate circle who relates to what they're going through.
            </p>
            <p>
              Mainstream social media isn't designed for this kind of fellowship. It's built for engagement metrics,
              not spiritual growth. And while there are Christian apps and forums, few are built specifically for
              believers who want to go deeper in their walk and connect with others doing the same.
            </p>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-12 px-4 bg-accent/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Our Solution</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Chosen Connect is an open, faith-centered community platform built with intention and care.
            Here's what makes it different:
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2.5 shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Safe and Welcoming</h3>
                <p className="text-sm text-muted-foreground">
                  A warm, respectful space where anyone can share freely without judgment. Your spiritual experiences
                  are valued and respected here.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2.5 shrink-0">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Purpose-Built for Fellowship</h3>
                <p className="text-sm text-muted-foreground">
                  Every feature is designed to deepen your walk with God and strengthen your connections
                  with fellow believers. No ads, no distractions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2.5 shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Community-Driven</h3>
                <p className="text-sm text-muted-foreground">
                  Built by believers, for believers. Early members will help shape the community's direction
                  and culture from the ground up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">What We Believe</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We believe that every believer has been given unique gifts by God, and that those gifts are meant
              to be shared, developed, and celebrated in community.
            </p>
            <p>
              We believe in creating space for honest conversation, heartfelt prayer, and genuine encouragement.
              We're not here to replace your church or your pastor &mdash; we're here to walk alongside you as
              brothers and sisters in faith.
            </p>
            <p>
              We believe that technology, when used with intention, can bring people closer together and closer
              to God. That's what we're building.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Join Us on This Journey</h2>
          <p className="text-muted-foreground mb-6">
            We're just getting started, and we'd love for you to be part of it. Sign up for the waitlist and
            be among the first to experience Chosen Connect.
          </p>
          <Link href="/join">
            <Button size="lg" className="rounded-full px-8" data-umami-event="about-join-cta">
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
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
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
