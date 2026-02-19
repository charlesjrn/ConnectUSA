import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    requestResetMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/chosen-connect-logo.png" 
              alt="Chosen Connect" 
              className="h-32 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            {isSubmitted
              ? "Check your email for a password reset link"
              : "Enter your email address and we'll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={requestResetMutation.isPending}
              >
                {requestResetMutation.isPending ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setLocation("/login")}
                  className="text-sm"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.</p>
                <p className="mt-2">Please check your email and follow the instructions.</p>
              </div>

              <Button
                onClick={() => setLocation("/login")}
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
