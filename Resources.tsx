import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Video, 
  Download,
  Lock,
  ExternalLink,
  Sparkles,
  Crown
} from "lucide-react";

export default function Resources() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: membershipStatus, isLoading: membershipLoading } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

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

  const isFounder = membershipStatus?.isFounder;

  // Resources available to all members (free tier)
  const freeResources = [
    {
      title: "7-Day Devotional for the Chosen",
      description: "A journey of faith, purpose, and divine connection",
      type: "PDF",
      icon: BookOpen,
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-400",
      downloadUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663276675485/NdgKcIKRPooHOqyb.pdf",
      available: true
    },
    {
      title: "The Chosen One's Prayer Guide",
      description: "A practical guide to deepening your prayer life",
      type: "PDF",
      icon: FileText,
      color: "from-amber-500/20 to-amber-600/20",
      iconColor: "text-amber-400",
      downloadUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663276675485/BZHeelawNTLuDUZw.pdf",
      available: true
    },
    {
      title: "Discovering Your Spiritual Gifts",
      description: "Understand and develop your God-given abilities",
      type: "PDF",
      icon: Sparkles,
      color: "from-emerald-500/20 to-emerald-600/20",
      iconColor: "text-emerald-400",
      downloadUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663276675485/JBLPVzvopSQuAUGY.pdf",
      available: true
    }
  ];

  // Resources available to Founders
  const founderResources = [
    {
      title: "Prayer Workshop Replay",
      description: "Recording of our live prayer training session",
      type: "Video",
      icon: Video,
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-400",
      available: false,
      comingSoon: true,
      founderOnly: true
    },
    {
      title: "Testimony Writing Masterclass",
      description: "How to craft and share your testimony effectively",
      type: "Video",
      icon: Video,
      color: "from-rose-500/20 to-rose-600/20",
      iconColor: "text-rose-400",
      available: false,
      comingSoon: true,
      founderOnly: true
    },
    {
      title: "Vision Interpretation Guide",
      description: "Biblical principles for understanding visions and dreams",
      type: "PDF",
      icon: BookOpen,
      color: "from-indigo-500/20 to-indigo-600/20",
      iconColor: "text-indigo-400",
      available: false,
      comingSoon: true,
      founderOnly: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
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

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Member Resources</h1>
          <p className="text-white/60">
            Devotionals, guides, and tools to help you grow in your faith journey
          </p>
        </div>
      </section>

      {/* Free Resources Section */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-6">Available Resources</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeResources.map((resource, index) => (
              <Card 
                key={index}
                className={`bg-gradient-to-br ${resource.color} border-white/10 hover:border-white/20 transition-all duration-300`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <resource.icon className={`w-6 h-6 ${resource.iconColor}`} />
                    </div>
                    <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                      {resource.type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{resource.description}</p>
                  
                  <Button
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => {
                      if (resource.downloadUrl) {
                        window.open(resource.downloadUrl, "_blank");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Resources Section */}
      <section className="py-8 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Founder-Exclusive Resources</h2>
          </div>
          
          {!isFounder && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
              <p className="text-amber-200 text-sm">
                <Crown className="w-4 h-4 inline mr-2" />
                These resources are available to Founding Members. 
                <Button
                  variant="link"
                  className="text-amber-400 hover:text-amber-300 p-0 h-auto ml-1"
                  onClick={() => setLocation("/membership")}
                >
                  Become a Founder
                </Button>
                {" "}to unlock them.
              </p>
            </div>
          )}
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {founderResources.map((resource, index) => (
              <Card 
                key={index}
                className={`bg-gradient-to-br ${resource.color} border-white/10 ${!isFounder ? 'opacity-60' : 'hover:border-white/20'} transition-all duration-300`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                      <resource.icon className={`w-6 h-6 ${resource.iconColor}`} />
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                        Founder
                      </span>
                      <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                        {resource.type}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{resource.description}</p>
                  
                  {resource.comingSoon ? (
                    <Button
                      disabled
                      className="w-full bg-white/5 text-white/50 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Coming Soon
                    </Button>
                  ) : isFounder ? (
                    <Button
                      className="w-full bg-white/10 hover:bg-white/20 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                      onClick={() => setLocation("/membership")}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Unlock with Founder
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Request Section */}
      <section className="py-12 px-4 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-white mb-4">
            Have a Resource Request?
          </h2>
          <p className="text-white/60 mb-6">
            We're always looking to add valuable content for our members. Let us know what topics you'd like us to cover.
          </p>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setLocation("/submit-testimony")}
          >
            Submit a Request
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-white/40 text-sm">
            © 2024 Chosen Connect. All rights reserved.
          </p>
          <p className="text-white/30 text-xs max-w-2xl mx-auto">
            Chosen Connect is a for-profit community platform. Profits will be spent to build God's kingdom! Content is shared for fellowship and encouragement, not as professional or pastoral advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
