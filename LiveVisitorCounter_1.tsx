import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Eye } from "lucide-react";

export function LiveVisitorCounter() {
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID from localStorage
    let id = localStorage.getItem("visitor_session_id");
    if (!id) {
      id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("visitor_session_id", id);
    }
    return id;
  });

  const { data: countData } = trpc.visitors.getCount.useQuery(undefined, {
    refetchInterval: 5000, // Refresh count every 5 seconds
  });

  const heartbeatMutation = trpc.visitors.heartbeat.useMutation();

  useEffect(() => {
    // Send initial heartbeat
    heartbeatMutation.mutate({ sessionId });

    // Send heartbeat every 15 seconds
    const interval = setInterval(() => {
      heartbeatMutation.mutate({ sessionId });
    }, 15000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const count = countData?.count ?? 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-full text-sm font-medium">
      <Eye className="w-4 h-4" />
      <span>{count} viewing</span>
    </div>
  );
}
