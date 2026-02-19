import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem("welcomeBannerDismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("welcomeBannerDismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Card className="relative p-6 mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="pr-8">
        <h2 className="text-2xl font-bold mb-3" style={{ color: "#D4AF37" }}>
          ✨ Welcome to Chosen Connect
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          A sacred gathering place for those <strong>chosen and called by God</strong> to fulfill His divine purpose. 
          Share your visions, encounters, spiritual gifts, and testimonies with fellow believers walking in faith.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Join Community - It's Free!
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="border-amber-600 text-amber-700 hover:bg-amber-50"
          >
            Continue Browsing
          </Button>
        </div>
      </div>
    </Card>
  );
}
