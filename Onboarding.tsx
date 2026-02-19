import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CheckCircle2, MapPin, Sparkles, Calendar, User } from "lucide-react";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Onboarding() {
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(1);
  
  const { user } = useAuth();
  
  // Form state
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [chosenDate, setChosenDate] = useState("");
  const [spiritualGifts, setSpiritualGifts] = useState("");
  const [bio, setBio] = useState("");

  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile Updated! Your profile has been successfully completed.");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const completeOnboardingMutation = trpc.profile.completeOnboarding.useMutation();

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Update profile with all collected information
      await updateProfileMutation.mutateAsync({
        name: name || undefined,
        profilePicture: profilePicture || undefined,
        location: locationValue || undefined,
        chosenDate: chosenDate ? new Date(chosenDate) : undefined,
        spiritualGifts: spiritualGifts || undefined,
        bio: bio || undefined,
      });

      // Mark onboarding as complete
      await completeOnboardingMutation.mutateAsync();
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  const getProgress = () => {
    let completed = 0;
    if (name) completed++;
    if (location) completed++;
    if (chosenDate) completed++;
    if (spiritualGifts || bio) completed++;
    return (completed / 4) * 100;
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return locationValue.trim().length > 0;
      case 3:
        return chosenDate.trim().length > 0;
      case 4:
        return spiritualGifts.trim().length > 0 || bio.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3E8] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">
            ✨ Welcome to Chosen Connect! ✨
          </h1>
          <p className="text-gray-600 text-lg">
            Let's set up your profile so the community can get to know you
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {step} of 4
            </span>
            <span className="text-sm font-medium text-[#D4AF37]">
              {Math.round(getProgress())}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8900F] h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Name & Profile Picture */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Let's set up your profile</h2>
                  <p className="text-gray-600">Add your name and picture</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <ProfilePictureUpload
                  currentPicture={profilePicture || user?.profilePicture}
                  userName={name || user?.name || undefined}
                  onUploadComplete={(url) => setProfilePicture(url)}
                  size="lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg py-6"
                  autoFocus
                />
              </div>
              
              <p className="text-sm text-gray-500 text-center">
                💡 Your name and picture help others recognize you in the community
              </p>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Where are you located?</h2>
                  <p className="text-gray-600">Connect with believers nearby</p>
                </div>
              </div>
              <LocationAutocomplete
                value={locationValue}
                onChange={setLocationValue}
                placeholder="Enter your city or location"
              />
              <p className="text-sm text-gray-500">
                🗺️ This helps you discover and connect with other believers in your area
              </p>
            </div>
          )}

          {/* Step 3: Chosen Date */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">When were you chosen?</h2>
                  <p className="text-gray-600">The date you realized God's calling</p>
                </div>
              </div>
              <Input
                type="date"
                value={chosenDate}
                onChange={(e) => setChosenDate(e.target.value)}
                className="text-lg py-6"
                autoFocus
              />
              <p className="text-sm text-gray-500">
                📅 Share the special day when you recognized God's calling on your life
              </p>
            </div>
          )}

          {/* Step 4: Spiritual Gifts & Bio */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Share your spiritual gifts</h2>
                  <p className="text-gray-600">Let others know how God works through you</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spiritual Gifts
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Prophecy, Healing, Teaching, Discernment"
                    value={spiritualGifts}
                    onChange={(e) => setSpiritualGifts(e.target.value)}
                    className="text-lg py-6"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About You (Optional)
                  </label>
                  <Textarea
                    placeholder="Share a bit about your spiritual journey..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[120px] text-lg"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                ✨ Help others understand how God is working through you and your spiritual journey
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="px-6"
            >
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 bg-[#D4AF37] hover:bg-[#B8900F] text-black font-semibold"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || updateProfileMutation.isPending}
                className="px-8 bg-[#D4AF37] hover:bg-[#B8900F] text-black font-semibold"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Profile
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center mt-4">
            <button
              onClick={() => setLocation("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="text-center mt-6 text-gray-600">
          <p className="italic">
            "For many are called, but few are chosen." - Matthew 22:14
          </p>
        </div>
      </div>
    </div>
  );
}
