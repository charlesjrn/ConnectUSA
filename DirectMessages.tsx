import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User } from "lucide-react";
import { useLocation } from "wouter";
import InnerCircleGate from "@/components/InnerCircleGate";

export default function DirectMessages() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: users = [] } = trpc.directMessages.listUsers.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: messages = [], refetch } = trpc.directMessages.getConversation.useQuery(
    { otherUserId: selectedUserId! },
    { enabled: !!selectedUserId, refetchInterval: 3000 }
  );

  const sendMutation = trpc.directMessages.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      refetch();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5dc]">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedUserId) return;

    sendMutation.mutate({
      receiverId: selectedUserId,
      content: messageContent,
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <InnerCircleGate featureName="Direct messaging">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-serif text-gray-900 mb-2">Direct Messages</h1>
        <p className="text-gray-600 mb-8">Personal conversations with community members</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User List */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-serif text-gray-900 mb-4">Community Members</h2>
            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUserId === u.id
                      ? "bg-[#DAA520] text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#DAA520] text-white flex items-center justify-center font-serif">
                      {u.name?.charAt(0).toUpperCase() || <User size={20} />}
                    </div>
                    <div>
                      <p className="font-medium">{u.name || "Anonymous"}</p>
                      <p className="text-sm opacity-70">{u.email || ""}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md flex flex-col" style={{ height: "600px" }}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#DAA520] text-white flex items-center justify-center font-serif text-xl">
                      {selectedUser.name?.charAt(0).toUpperCase() || <User size={24} />}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-gray-900">{selectedUser.name || "Anonymous"}</h3>
                      <p className="text-sm text-gray-500">{selectedUser.email || ""}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isOwnMessage = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? "bg-[#DAA520] text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? "text-white/70" : "text-gray-500"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!messageContent.trim() || sendMutation.isPending}
                      className="bg-[#DAA520] hover:bg-[#B8860B] text-white"
                    >
                      <Send size={20} />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a community member to start a conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </InnerCircleGate>
    </div>
  );
}
