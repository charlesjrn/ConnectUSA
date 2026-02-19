import { useEffect, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, Loader2 } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function FoundingCircleSuccess() {
  const searchString = useSearch();
  const sessionId = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("session_id") || "";
  }, [searchString]);

  const { data, isLoading, error } = trpc.membership.verifySession.useQuery(
    { sessionId },
    { enabled: !!sessionId, retry: 3, retryDelay: 2000 }
  );

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteNav links={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }]} />
        <div className="py-24 px-4 text-center">
          <p className="text-muted-foreground">No session found. Please try again.</p>
          <Link href="/founding-circle">
            <Button className="mt-4 rounded-full">Back to Founding Circle</Button>
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav links={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }]} />

      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          {isLoading ? (
            <>
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Verifying your payment...</h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your membership.
              </p>
            </>
          ) : data?.verified ? (
            <>
              <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Welcome to the Founding Circle!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for becoming a founding member. You are now part of a small group of
                believers committed to building something meaningful together.
              </p>

              <div className="bg-card border border-border/50 rounded-xl p-6 mb-8 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">What happens next</h2>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    You'll receive a welcome email with details about the Founding Circle.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    Access to the private discussion space will be set up shortly.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    You'll be invited to the next monthly live fellowship call.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    Your Founding Member badge will appear on your profile.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button className="rounded-full px-6">Back to Home</Button>
                </Link>
                <Link href="/founding-circle">
                  <Button variant="outline" className="rounded-full px-6">
                    View Founding Circle
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="bg-amber-100 rounded-full p-4 w-fit mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Payment Processing
              </h1>
              <p className="text-muted-foreground mb-6">
                {data?.message || "Your payment is being processed. This may take a moment."}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                If your payment was successful, your membership will be activated shortly.
                You can check back in a few minutes.
              </p>
              <Link href="/founding-circle">
                <Button className="rounded-full px-6">Back to Founding Circle</Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
