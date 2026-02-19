import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import InnerCircleGate from "@/components/InnerCircleGate";

export default function Chat() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], refetch } = trpc.messages.byRoom.useQuery(
    { room: "chatroom" },
    { refetchInterval: 3000 }
  );
  const sendMessage = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessage("");
      refetch();
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3E8]">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({
      content: message,
      room: "chatroom",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3E8]">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <InnerCircleGate featureName="Chat rooms">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-serif text-gray-900 mb-2">Chat</h1>
          <p className="text-gray-600">General conversation and fellowship with the community.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.userId === user.id;
                const userName = msg.userName || msg.userEmail || "Anonymous";
                const initials = userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-yellow-800">{initials}</span>
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 ${isOwnMessage ? "text-right" : ""}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-gray-900">{userName}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(msg.createdAt), "h:mm a")}
                        </span>
                      </div>
                      <div
                        className={`inline-block px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={sendMessage.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessage.isPending}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      </InnerCircleGate>
    </div>
  );
}
