import { Heart, Share2, Copy, Check, BookOpen } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { useAuth } from '../_core/hooks/useAuth';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export function VerseOfTheDay() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const { data: verse } = trpc.verses.getToday.useQuery();
  const { data: isFavorited } = trpc.verses.isFavorited.useQuery(
    { verseId: verse?.id || 0 },
    { enabled: !!user && !!verse }
  );
  
  const toggleFavoriteMutation = trpc.verses.toggleFavorite.useMutation({
    onSuccess: (data) => {
      toast.success(data.favorited ? 'Added to favorites' : 'Removed from favorites');
    },
  });

  const handleCopyVerse = () => {
    if (!verse) return;
    const text = `"${verse.verseText}" - ${verse.reference}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Verse copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!verse) return;
    const text = `"${verse.verseText}" - ${verse.reference}`;
    const url = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'Verse of the Day',
        text: text,
        url: url,
      });
    } else {
      handleCopyVerse();
    }
  };

  const handleToggleFavorite = () => {
    if (!verse) return;
    toggleFavoriteMutation.mutate({ verseId: verse.id });
  };

  if (!verse) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-amber-600/15 to-purple-600/20 border-2 border-amber-500/40 rounded-xl p-6 mb-8 shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-amber-400">Verse of the Day</h3>
          </div>
          <div className="flex gap-1">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className="h-8 w-8 hover:bg-white/10"
              >
                <Heart
                  className={`h-4 w-4 ${isFavorited ? 'fill-red-400 text-red-400' : 'text-white/60 hover:text-white'}`}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyVerse}
              className="h-8 w-8 hover:bg-white/10"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4 text-white/60 hover:text-white" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 hover:bg-white/10"
            >
              <Share2 className="h-4 w-4 text-white/60 hover:text-white" />
            </Button>
          </div>
        </div>
        
        <blockquote className="text-white/90 italic text-xl mb-4 leading-relaxed font-serif">
          "{verse.verseText}"
        </blockquote>
        
        <p className="text-amber-400 font-bold text-right text-lg">
          — {verse.reference}
        </p>
      </div>
    </div>
  );
}
