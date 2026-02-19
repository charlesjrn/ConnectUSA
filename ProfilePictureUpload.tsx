import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfilePictureUploadProps {
  currentPicture?: string | null;
  userName?: string;
  onUploadComplete?: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

export function ProfilePictureUpload({
  currentPicture,
  userName,
  onUploadComplete,
  size = "lg",
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.profile.uploadPicture.useMutation({
    onSuccess: (data) => {
      setPreviewUrl(data.url);
      onUploadComplete?.(data.url);
      toast.success("Profile picture uploaded successfully!");
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload picture");
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1]; // Remove data:image/...;base64, prefix

      try {
        await uploadMutation.mutateAsync({
          imageData: base64Data,
          mimeType: file.type,
        });
      } catch (error) {
        // Error handled in mutation
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const displayPicture = previewUrl || currentPicture;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={displayPicture || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
            {userName?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-lg"
          onClick={handleClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        Click the camera icon to upload a profile picture (max 5MB)
      </p>
    </div>
  );
}
