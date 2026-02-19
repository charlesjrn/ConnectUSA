import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export function MemberSpotlight() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: spotlight, isLoading } = trpc.users.getSpotlight.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: members } = trpc.users.getAllMembers.useQuery(undefined, { enabled: user?.role === 'admin' });
  const setFeaturedMutation = trpc.users.setFeaturedMember.useMutation();
  const clearFeaturedMutation = trpc.users.clearFeaturedMember.useMutation();
  const utils = trpc.useUtils();

  if (isLoading || !spotlight) return null;

  return (
    <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-2xl font-bold text-purple-900">Member of the Week</h3>
          </div>
          {user?.role === 'admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center cursor-pointer hover:bg-purple-300 transition-colors"
            onClick={() => setLocation(`/user/${spotlight.id}`)}
          >
            <span className="text-2xl font-bold text-purple-700">
              {spotlight.name?.[0]?.toUpperCase() || "C"}
            </span>
          </div>
          <div className="flex-1">
            <h4 
              className="text-xl font-semibold text-purple-900 cursor-pointer hover:text-purple-700 transition-colors"
              onClick={() => setLocation(`/user/${spotlight.id}`)}
            >
              {spotlight.name}
            </h4>
            <p className="text-sm text-purple-700 mb-2">
              {spotlight.testimonyCount} {spotlight.testimonyCount === 1 ? 'testimony' : 'testimonies'} shared • 
              {spotlight.totalLikes} {spotlight.totalLikes === 1 ? 'like' : 'likes'} received
            </p>
            {spotlight.latestTestimony && (
              <div className="mt-3 p-3 bg-white/70 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-900 mb-1">Latest testimony:</p>
                <p 
                  className="text-sm text-gray-700 line-clamp-2 cursor-pointer hover:text-purple-700"
                  onClick={() => setLocation(`/testimony/${spotlight.latestTestimony.id}`)}
                >
                  {spotlight.latestTestimony.title || spotlight.latestTestimony.content.substring(0, 100)}...
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Admin Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Member of the Week</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  await clearFeaturedMutation.mutateAsync();
                  await utils.users.getSpotlight.invalidate();
                  toast.success("Cleared featured member. Showing automatic selection.");
                  setDialogOpen(false);
                } catch (error) {
                  toast.error("Failed to clear featured member");
                }
              }}
            >
              Clear Featured Member (Use Automatic Selection)
            </Button>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Select a Member:</h4>
              <div className="space-y-2">
                {members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={member.isFeaturedMember ? "default" : "outline"}
                      onClick={async () => {
                        try {
                          await setFeaturedMutation.mutateAsync({ userId: member.id });
                          await utils.users.getSpotlight.invalidate();
                          toast.success(`${member.name} is now the featured member!`);
                          setDialogOpen(false);
                        } catch (error) {
                          toast.error("Failed to set featured member");
                        }
                      }}
                    >
                      {member.isFeaturedMember ? "Featured" : "Select"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
