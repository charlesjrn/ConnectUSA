import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail, Bell, MessageSquare, Heart, HandHeart } from "lucide-react";

export default function EmailPreferences() {
  const { data: preferences, isLoading, refetch } = trpc.profile.getEmailPreferences.useQuery();
  const updateMutation = trpc.profile.updateEmailPreferences.useMutation({
    onSuccess: () => {
      toast.success("Email preferences updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update preferences");
    },
  });

  const [emailComments, setEmailComments] = useState(true);
  const [emailDirectMessages, setEmailDirectMessages] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(true);
  const [emailLikes, setEmailLikes] = useState(true);
  const [emailPrayers, setEmailPrayers] = useState(true);

  useEffect(() => {
    if (preferences) {
      setEmailComments(preferences.emailComments);
      setEmailDirectMessages(preferences.emailDirectMessages);
      setEmailWeeklyDigest(preferences.emailWeeklyDigest);
      setEmailLikes(preferences.emailLikes);
      setEmailPrayers(preferences.emailPrayers);
    }
  }, [preferences]);

  const handleSave = () => {
    updateMutation.mutate({
      emailComments,
      emailDirectMessages,
      emailWeeklyDigest,
      emailLikes,
      emailPrayers,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f1e8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a574]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Email Preferences</h1>
          <p className="text-gray-600">
            Customize which email notifications you want to receive from Chosen Connect
          </p>
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Comments */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-100">
            <div className="flex items-start space-x-3 flex-1">
              <MessageSquare className="w-5 h-5 text-[#d4a574] mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Comments on my testimonies</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Get notified when someone comments on your posts
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailComments}
                onChange={(e) => setEmailComments(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#d4a574]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a574]"></div>
            </label>
          </div>

          {/* Direct Messages */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-100">
            <div className="flex items-start space-x-3 flex-1">
              <Mail className="w-5 h-5 text-[#d4a574] mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Direct messages</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Receive emails when you get a new direct message
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailDirectMessages}
                onChange={(e) => setEmailDirectMessages(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#d4a574]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a574]"></div>
            </label>
          </div>

          {/* Weekly Digest */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-100">
            <div className="flex items-start space-x-3 flex-1">
              <Bell className="w-5 h-5 text-[#d4a574] mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Weekly digest</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Get a weekly summary of community activity and highlights
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailWeeklyDigest}
                onChange={(e) => setEmailWeeklyDigest(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#d4a574]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a574]"></div>
            </label>
          </div>

          {/* Likes */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-100">
            <div className="flex items-start space-x-3 flex-1">
              <Heart className="w-5 h-5 text-[#d4a574] mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Likes on my testimonies</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Get notified when someone likes your posts
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailLikes}
                onChange={(e) => setEmailLikes(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#d4a574]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a574]"></div>
            </label>
          </div>

          {/* Prayer Updates */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <HandHeart className="w-5 h-5 text-[#d4a574] mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Prayer request updates</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Receive updates when someone prays for your requests or marks them as answered
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailPrayers}
                onChange={(e) => setEmailPrayers(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#d4a574]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4a574]"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-[#d4a574] hover:bg-[#c49564] text-white px-8"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> You can always update these preferences later. We respect your inbox and will only send you emails you've opted into.
          </p>
        </div>
      </div>
    </div>
  );
}
