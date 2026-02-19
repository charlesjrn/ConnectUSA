import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Facebook, Twitter, Link2, Instagram } from "lucide-react";
import { toast } from "sonner";

interface SocialShareButtonsProps {
  title: string;
  content: string;
  url: string;
}

export function SocialShareButtons({ title, content, url }: SocialShareButtonsProps) {
  const shareUrl = typeof window !== "undefined" ? window.location.origin + url : url;
  const shareText = `${title}\n\n${content.substring(0, 200)}${content.length > 200 ? "..." : ""}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support direct web sharing, so copy link instead
    handleCopyLink();
    toast.info("Link copied! Open Instagram app to share");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleFacebookShare} className="gap-2 cursor-pointer">
          <Facebook className="w-4 h-4" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="gap-2 cursor-pointer">
          <Twitter className="w-4 h-4" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleInstagramShare} className="gap-2 cursor-pointer">
          <Instagram className="w-4 h-4" />
          Share on Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
          <Link2 className="w-4 h-4" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
