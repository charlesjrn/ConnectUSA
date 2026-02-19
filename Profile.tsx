import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";
import { AvatarCustomizer } from "@/components/AvatarCustomizer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { 
  Calendar, 
  AlertTriangle, 
  Crown, 
  Sparkles, 
  ArrowLeft,
  User,
  MapPin,
  Heart,
  Star,
  Edit3,
  Save,
  X
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Profile() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [spiritualGifts, setSpiritualGifts] = useState(user?.spiritualGifts || "");
  const [calling, setCalling] = useState((user as any)?.calling || "");
  const [location, setLocationValue] = useState(user?.location || "");
  const [chosenDate, setChosenDate] = useState(
    user?.chosenDate ? format(new Date(user.chosenDate), "yyyy-MM-dd") : "2024-12-25"
  );

  const { data: membershipStatus } = trpc.membership.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  const isFounder = membershipStatus?.isFounder;

  const utils = trpc.useUtils();
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const deleteAccount = trpc.auth.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted successfully");
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleSave = () => {
    updateProfile.mutate({
      name: name || undefined,
      bio: bio || undefined,
      spiritualGifts: spiritualGifts || undefined,
      calling: calling || undefined,
      chosenDate: chosenDate ? new Date(chosenDate) : undefined,
      location: location || undefined,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateYears = (date: string) => {
    const chosen = new Date(date);
    const now = new Date();
    const years = now.getFullYear() - chosen.getFullYear();
    return years;
  };

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
              className="h-10 w-auto"
            />
            <span className="text-white font-semibold text-lg hidden sm:block">Chosen Connect</span>
          </div>
          <div className="flex items-center gap-4">
            {isFounder ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">Founder</span>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/membership")}
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-white/70 text-sm">Your Profile</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            My Profile
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Card */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-amber-500/30 via-purple-500/20 to-blue-500/30" />
            
            <CardContent className="relative pt-0 pb-8">
              {/* Avatar */}
              <div className="flex flex-col items-center -mt-16">
                {isEditing ? (
                  <div className="border-4 border-[#1a1a2e] rounded-full bg-[#1a1a2e] shadow-lg">
                    <ProfilePictureUpload
                      currentPicture={user.profilePicture ?? undefined}
                      userName={user.name ?? undefined}
                      onUploadComplete={(url) => {
                        updateProfile.mutate({ profilePicture: url });
                      }}
                      size="lg"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-[#1a1a2e] shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/30 to-purple-500/30 border-4 border-[#1a1a2e] flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-bold text-white">
                          {getInitials(user.name || "Chosen One")}
                        </span>
                      </div>
                    )}
                    {isFounder && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center border-2 border-[#1a1a2e]">
                        <Crown className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                )}
                
                <h2 className="text-2xl font-bold text-white mt-4">{user.name || "Anonymous"}</h2>
                
                {location && (
                  <div className="flex items-center gap-1 text-white/60 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="mt-4 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
                  <span className="text-amber-400 font-medium">✨ Chosen One</span>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* About Me Section */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">About Me</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-white/70">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className={`mt-1.5 bg-white/5 border-white/20 text-white placeholder:text-white/40 ${!isEditing ? 'opacity-70' : ''}`}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio" className="text-white/70">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell your story..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    disabled={!isEditing}
                    className={`mt-1.5 bg-white/5 border-white/20 text-white placeholder:text-white/40 ${!isEditing ? 'opacity-70' : ''}`}
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-white/70">Location</Label>
                  <LocationAutocomplete
                    value={location}
                    onChange={setLocationValue}
                    disabled={!isEditing}
                    placeholder="City, State"
                    className={`mt-1.5 bg-white/5 border-white/20 text-white placeholder:text-white/40 ${!isEditing ? 'opacity-70' : ''}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spiritual Gifts Section */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Spiritual Gifts</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="spiritualGifts" className="text-white/70">My Gifts</Label>
                  <Textarea
                    id="spiritualGifts"
                    placeholder="Share your spiritual gifts (e.g., prophecy, healing, teaching, discernment...)"
                    value={spiritualGifts}
                    onChange={(e) => setSpiritualGifts(e.target.value)}
                    rows={3}
                    disabled={!isEditing}
                    className={`mt-1.5 bg-white/5 border-white/20 text-white placeholder:text-white/40 ${!isEditing ? 'opacity-70' : ''}`}
                  />
                </div>

                <div>
                  <Label htmlFor="calling" className="text-white/70">My Calling</Label>
                  <Textarea
                    id="calling"
                    placeholder="Describe your calling or purpose (e.g., to serve the homeless, to teach children, to lead worship...)"
                    value={calling}
                    onChange={(e) => setCalling(e.target.value)}
                    rows={3}
                    disabled={!isEditing}
                    className={`mt-1.5 bg-white/5 border-white/20 text-white placeholder:text-white/40 ${!isEditing ? 'opacity-70' : ''}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Journey Section */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">My Journey</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="chosenDate" className="text-white/70">Known Since</Label>
                  <div className="relative mt-1.5">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="chosenDate"
                      type="date"
                      value={chosenDate}
                      onChange={(e) => setChosenDate(e.target.value)}
                      disabled={!isEditing}
                      className={`pl-10 bg-white/5 border-white/20 text-white ${!isEditing ? 'opacity-70' : ''}`}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/60">
                    Walking in the light for{" "}
                    <span className="font-semibold text-amber-400">
                      {calculateYears(chosenDate)} years
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatar Customization */}
          {isEditing && (
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Avatar Customization</h3>
                </div>
                <AvatarCustomizer
                  currentColor={user.avatarBackgroundColor ?? undefined}
                  currentIcon={user.avatarIcon ?? undefined}
                  userName={user.name ?? undefined}
                />
              </CardContent>
            </Card>
          )}

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name || "");
                  setBio(user.bio || "");
                  setSpiritualGifts(user.spiritualGifts || "");
                  setCalling((user as any)?.calling || "");
                  setLocationValue(user.location || "");
                  setChosenDate(
                    user.chosenDate ? format(new Date(user.chosenDate), "yyyy-MM-dd") : "2024-12-25"
                  );
                }}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}

          {/* Danger Zone */}
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-white/60 mb-4">
                    Once you delete your account, there is no going back. All your posts, prayers, and data will be permanently removed.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
                        if (confirm("This will permanently delete all your data. Type DELETE to confirm.")) {
                          deleteAccount.mutate();
                        }
                      }
                    }}
                    disabled={deleteAccount.isPending}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
