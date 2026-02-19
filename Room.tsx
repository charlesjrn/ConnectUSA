import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";

const ROOM_NAMES: Record<string, string> = {
  gift: "Gifts",
  vision: "Visions",
  encounter: "Encounters",
  testimony: "Testimonies",
  prayer: "Prayer",
  missions: "Missions",
  chatroom: "Chatroom",
  meetup: "Meet Up",
};

export default function Room() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId as "gift" | "vision" | "encounter" | "testimony" | "prayer" | "missions" | "chatroom" | "meetup";
  
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = trpc.messages.byRoom.useQuery(
    { room: roomId },
    { 
      enabled: !!roomId,
      refetchInterval: 3000, // Poll every 3 seconds for new messages
    }
  );

  const utils = trpc.useUtils();
  const sendMessage = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessage("");
      utils.messages.byRoom.invalidate({ room: roomId });
      scrollToBottom();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (!roomId || !ROOM_NAMES[roomId]) {
    setLocation("/dashboard");
    return null;
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessage.mutate({
      content: message,
      room: roomId,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">{ROOM_NAMES[roomId]}</h1>
            </div>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.name || user.email}
          </span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        <Card className="flex-1 bg-card border-border p-4 mb-4 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading messages...
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No messages yet</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to share in this sacred space
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.userId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {isOwnMessage ? "You" : msg.userName || msg.userEmail || "Anonymous"}
                        </span>
                        <span className="text-xs opacity-70">
                          {format(new Date(msg.createdAt), "h:mm a")}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your message..."
            className="flex-1 bg-card"
            disabled={sendMessage.isPending}
          />
          <Button
            type="submit"
            disabled={sendMessage.isPending || !message.trim()}
            className="bg-primary text-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </main>
    </div>
  );
}
