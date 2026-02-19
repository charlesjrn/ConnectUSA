import { Heart, Copy, Check } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { useAuth } from '../_core/hooks/useAuth';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export default function VerseArchive() {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const { data: verses = [] } = trpc.verses.getAll.useQuery();
  const { data: favorites = [] } = trpc.verses.getFavorites.useQuery(undefined, {
    enabled: !!user,
  });
  
  const toggleFavoriteMutation = trpc.verses.toggleFavorite.useMutation({
    onSuccess: (data) => {
      toast.success(data.favorited ? 'Added to favorites' : 'Removed from favorites');
    },
  });

  const favoriteIds = new Set(favorites.map(f => f.id));

  const handleCopyVerse = (verse: any) => {
    const text = `"${verse.verseText}" - ${verse.reference}`;
    navigator.clipboard.writeText(text);
    setCopiedId(verse.id);
    toast.success('Verse copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = (verseId: number) => {
    toggleFavoriteMutation.mutate({ verseId });
  };

  return (
    <div className="min-h-screen bg-[#F5F3E8]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">Verse Archive</h1>
          <p className="text-gray-600">Browse past daily scripture verses</p>
        </div>

        {user && favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Your Favorites</h2>
            <div className="grid gap-4">
              {favorites.map((verse) => (
                <div
                  key={verse.id}
                  className="bg-white border border-[#D4AF37]/30 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm text-gray-500">
                      {new Date(verse.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(verse.id)}
                        className="h-8 w-8"
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyVerse(verse)}
                        className="h-8 w-8"
                      >
                        {copiedId === verse.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 italic text-base mb-2 leading-relaxed">
                    "{verse.verseText}"
                  </blockquote>
                  
                  <p className="text-[#D4AF37] font-semibold text-right">
                    — {verse.reference}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">All Verses</h2>
        </div>

        <div className="grid gap-4">
          {verses.map((verse) => (
            <div
              key={verse.id}
              className="bg-white border border-[#D4AF37]/20 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-gray-500">
                  {new Date(verse.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <div className="flex gap-2">
                  {user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFavorite(verse.id)}
                      className="h-8 w-8"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favoriteIds.has(verse.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-500'
                        }`}
                      />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyVerse(verse)}
                    className="h-8 w-8"
                  >
                    {copiedId === verse.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              
              <blockquote className="text-gray-700 italic text-base mb-2 leading-relaxed">
                "{verse.verseText}"
              </blockquote>
              
              <p className="text-[#D4AF37] font-semibold text-right">
                — {verse.reference}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
