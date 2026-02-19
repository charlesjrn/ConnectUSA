import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, User, Heart, Star, Cross, Sparkles, Sun, Moon } from "lucide-react";

const COLORS = [
  { name: "Golden", value: "#D4AF37" },
  { name: "Royal Purple", value: "#6B46C1" },
  { name: "Deep Blue", value: "#2563EB" },
  { name: "Emerald", value: "#059669" },
  { name: "Rose", value: "#E11D48" },
  { name: "Amber", value: "#D97706" },
  { name: "Teal", value: "#0D9488" },
  { name: "Indigo", value: "#4F46E5" },
];

const ICONS = [
  { name: "User", value: "user", Icon: User },
  { name: "Heart", value: "heart", Icon: Heart },
  { name: "Star", value: "star", Icon: Star },
  { name: "Cross", value: "cross", Icon: Cross },
  { name: "Sparkles", value: "sparkles", Icon: Sparkles },
  { name: "Sun", value: "sun", Icon: Sun },
  { name: "Moon", value: "moon", Icon: Moon },
];

interface AvatarCustomizerProps {
  currentColor?: string;
  currentIcon?: string;
  userName?: string;
}

export function AvatarCustomizer({
  currentColor = "#D4AF37",
  currentIcon = "user",
  userName,
}: AvatarCustomizerProps) {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);

  const utils = trpc.useUtils();
  const customizeMutation = trpc.avatar.customize.useMutation({
    onSuccess: () => {
      toast.success("Avatar customized successfully!");
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to customize avatar");
    },
  });

  const handleSave = () => {
    customizeMutation.mutate({
      backgroundColor: selectedColor,
      icon: selectedIcon,
    });
  };

  const SelectedIconComponent = ICONS.find((i) => i.value === selectedIcon)?.Icon || User;
  const initials = userName?.charAt(0).toUpperCase() || "?";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Your Avatar</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a background color and icon for your avatar when you don't have a profile picture
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="flex justify-center">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg relative"
            style={{ backgroundColor: selectedColor }}
          >
            <span className="text-5xl font-bold text-white">{initials}</span>
            <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md">
              <SelectedIconComponent className="w-5 h-5" style={{ color: selectedColor }} />
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Background Color</label>
          <div className="grid grid-cols-4 gap-3">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className="relative group"
                title={color.name}
              >
                <div
                  className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    borderColor: selectedColor === color.value ? color.value : "transparent",
                    boxShadow: selectedColor === color.value ? `0 0 0 2px white, 0 0 0 4px ${color.value}` : "none",
                  }}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-center mt-1 text-muted-foreground">{color.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Icon</label>
          <div className="grid grid-cols-4 gap-3">
            {ICONS.map((icon) => (
              <button
                key={icon.value}
                onClick={() => setSelectedIcon(icon.value)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedIcon === icon.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                title={icon.name}
              >
                <icon.Icon className="w-8 h-8 mx-auto" />
                <p className="text-xs text-center mt-2">{icon.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={customizeMutation.isPending}
          className="w-full"
        >
          {customizeMutation.isPending ? "Saving..." : "Save Avatar Style"}
        </Button>
      </CardContent>
    </Card>
  );
}
