import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Eye, Send } from "lucide-react";

export default function SubmitVision() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    vision: "",
    interpretation: "",
    seekingFeedback: false
  });

  const { data: membershipStatus, isLoading: membershipLoading } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      toast.success("Vision submitted successfully!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit vision");
    },
  });

  // Redirect non-members
  if (!loading && !membershipLoading && user && !membershipStatus?.isFounder) {
    setLocation("/membership");
    return null;
  }

  if (loading || membershipLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vision.trim()) {
      toast.error("Please describe your vision or revelation");
      return;
    }

    const content = `**Date:** ${formData.date || "Not specified"}\n\n${formData.vision}${formData.interpretation ? `\n\n**My Interpretation:** ${formData.interpretation}` : ""}${formData.seekingFeedback ? "\n\n*Seeking community feedback on this vision*" : ""}`;
    
    sendMutation.mutate({
      title: formData.title || "Vision / Revelation",
      content,
      room: "vision",
      category: "vision"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Form Section */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Submit Vision / Revelation</h1>
            <p className="text-white/60">Share what God has revealed to you</p>
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Give your vision a title..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-white">Date of Vision</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vision" className="text-white">Vision / Revelation *</Label>
                  <Textarea
                    id="vision"
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    placeholder="Describe what you saw, heard, or experienced..."
                    rows={8}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interpretation" className="text-white">Your Interpretation (Optional)</Label>
                  <Textarea
                    id="interpretation"
                    value={formData.interpretation}
                    onChange={(e) => setFormData({ ...formData, interpretation: e.target.value })}
                    placeholder="What do you believe this vision means?"
                    rows={4}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <Label htmlFor="feedback" className="text-white">Seeking Feedback?</Label>
                    <p className="text-white/50 text-sm">Would you like community input on this vision?</p>
                  </div>
                  <Switch
                    id="feedback"
                    checked={formData.seekingFeedback}
                    onCheckedChange={(checked) => setFormData({ ...formData, seekingFeedback: checked })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-6"
                >
                  {sendMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Vision
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
