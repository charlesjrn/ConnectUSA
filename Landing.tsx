import { Button } from "../components/ui/button";
import { getLoginUrl } from "@/const";

export function Landing() {
  const handleJoinNow = () => {
    window.location.href = getLoginUrl();
  };

  const handleSignIn = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Hero Image Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/hero-chosen-connect.png)' }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* CTA Buttons Container */}
        <div className="flex flex-col gap-4 items-center mt-auto mb-20">
          {/* Join Now Button */}
          <Button
            onClick={handleJoinNow}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform transition hover:scale-105"
          >
            Join Now - It's Free!
          </Button>

          {/* Sign In Button */}
          <Button
            onClick={handleSignIn}
            variant="outline"
            size="lg"
            className="bg-white/90 hover:bg-white text-amber-900 font-semibold text-lg px-10 py-5 rounded-full shadow-xl border-2 border-amber-600 transform transition hover:scale-105"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
