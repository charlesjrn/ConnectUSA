import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";

export default function SubmitTestimony() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    title: "",
    whenEncountered: "",
    testimony: "",
    gifts: "",
    permissionToShare: true
  });

  const { data: membershipStatus, isLoading: membershipLoading } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      toast.success("Testimony submitted successfully!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit testimony");
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
    
    if (!formData.testimony.trim()) {
      toast.error("Please enter your testimony");
      return;
    }

    const content = `**When I encountered God:** ${formData.whenEncountered}\n\n${formData.testimony}${formData.gifts ? `\n\n**Spiritual Gifts:** ${formData.gifts}` : ""}`;
    
    sendMutation.mutate({
      title: formData.title || "My Testimony",
      content,
      room: "testimony",
      category: "testimony"
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
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Submit Your Testimony</h1>
            <p className="text-white/60">Share your encounter with God with the community</p>
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
                    placeholder="Give your testimony a title..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whenEncountered" className="text-white">When did you encounter God?</Label>
                  <Input
                    id="whenEncountered"
                    value={formData.whenEncountered}
                    onChange={(e) => setFormData({ ...formData, whenEncountered: e.target.value })}
                    placeholder="e.g., During a prayer meeting in 2020..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testimony" className="text-white">Your Testimony *</Label>
                  <Textarea
                    id="testimony"
                    value={formData.testimony}
                    onChange={(e) => setFormData({ ...formData, testimony: e.target.value })}
                    placeholder="Share your story of how God has worked in your life..."
                    rows={8}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gifts" className="text-white">Spiritual Gifts (Optional)</Label>
                  <Input
                    id="gifts"
                    value={formData.gifts}
                    onChange={(e) => setFormData({ ...formData, gifts: e.target.value })}
                    placeholder="e.g., Prophecy, Healing, Teaching..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <Label htmlFor="permission" className="text-white">Permission to Share</Label>
                    <p className="text-white/50 text-sm">Allow us to feature your testimony</p>
                  </div>
                  <Switch
                    id="permission"
                    checked={formData.permissionToShare}
                    onCheckedChange={(checked) => setFormData({ ...formData, permissionToShare: checked })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-6"
                >
                  {sendMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Testimony
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
