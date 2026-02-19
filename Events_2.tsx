import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, DollarSign, Video, Sparkles, Crown, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useLocation } from 'wouter';
import { getLoginUrl } from '@/const';

export default function Events() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: events, isLoading } = trpc.paidEvents.getActive.useQuery();

  const { data: membershipStatus } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  const isFounder = membershipStatus?.isFounder;

  const createCheckout = trpc.paidEvents.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success('Redirecting to checkout...');
        window.open(data.checkoutUrl, '_blank');
      }
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const handleRegister = (eventId: number) => {
    createCheckout.mutate({ eventId });
  };

  const getEventTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      conference: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      workshop: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      course: 'bg-green-500/20 text-green-300 border-green-500/30',
      retreat: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      webinar: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    };
    return colors[type] || 'bg-white/10 text-white/70 border-white/20';
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="text-white/70 hover:text-white mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663276675485/NYRoGrjvnCQVbZEX.png" 
              alt="Chosen Connect" 
              className="h-10 w-auto cursor-pointer"
              onClick={() => setLocation("/")}
            />
            <span className="text-white font-semibold text-lg hidden sm:block">Chosen Connect</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isFounder ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm font-medium hidden sm:inline">Founder</span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/membership")}
                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Upgrade</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/profile")}
                  className="text-white/70 hover:text-white"
                >
                  Profile
                </Button>
              </>
            ) : (
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
              >
                Join Free
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-white/70 text-sm">Live Events</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Spiritual Events & Courses
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Join our virtual conferences, workshops, and courses to deepen your faith 
            and connect with believers worldwide.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {!events || events.length === 0 ? (
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Events</h3>
                <p className="text-white/60">
                  Check back soon for new spiritual growth opportunities!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event: { id: number; title: string; description: string | null; eventType: string; eventDate: Date; price: string; capacity: number | null; imageUrl: string | null; meetingLink: string | null; isActive: boolean }) => (
                <Card key={event.id} className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 flex flex-col overflow-hidden">
                  {event.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${getEventTypeBadge(event.eventType)} border`}>
                        {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                      </Badge>
                      <div className="flex items-center gap-1 text-lg font-bold text-amber-400">
                        <DollarSign className="h-5 w-5" />
                        {parseFloat(event.price).toFixed(2)}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-white">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-white/60">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        {format(new Date(event.eventDate), 'MMMM d, yyyy')}
                      </div>

                      {event.capacity && (
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Users className="h-4 w-4 text-purple-400" />
                          Limited to {event.capacity} attendees
                        </div>
                      )}
                      {event.meetingLink && (
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Video className="h-4 w-4 text-emerald-400" />
                          Virtual event
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
                      onClick={() => handleRegister(event.id)}
                      disabled={createCheckout.isPending}
                    >
                      {createCheckout.isPending ? 'Processing...' : 'Register Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

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
