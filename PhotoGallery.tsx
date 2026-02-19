import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, X, Edit2, Loader2, Image as ImageIcon } from "lucide-react";

interface PhotoGalleryProps {
  userId: number;
  isOwner?: boolean;
}

export function PhotoGallery({ userId, isOwner = false }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<{ id: number; caption: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: photos, isLoading } = trpc.photoGallery.getByUserId.useQuery({ userId });
  const utils = trpc.useUtils();

  const addPhotoMutation = trpc.photoGallery.add.useMutation({
    onSuccess: () => {
      toast.success("Photo added to gallery!");
      utils.photoGallery.getByUserId.invalidate({ userId });
      setUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add photo");
      setUploading(false);
    },
  });

  const deletePhotoMutation = trpc.photoGallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Photo deleted");
      utils.photoGallery.getByUserId.invalidate({ userId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete photo");
    },
  });

  const updateCaptionMutation = trpc.photoGallery.updateCaption.useMutation({
    onSuccess: () => {
      toast.success("Caption updated");
      utils.photoGallery.getByUserId.invalidate({ userId });
      setEditingCaption(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update caption");
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const imageData = base64.split(",")[1];
      addPhotoMutation.mutate({ imageData, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (photoId: number) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      deletePhotoMutation.mutate({ photoId });
    }
  };

  const handleUpdateCaption = () => {
    if (!editingCaption) return;
    updateCaptionMutation.mutate({
      photoId: editingCaption.id,
      caption: editingCaption.caption,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Photo Gallery</h3>
        {isOwner && photos && photos.length < 10 && (
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Button disabled={uploading} asChild>
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Photo ({photos.length}/10)
                  </>
                )}
              </span>
            </Button>
          </label>
        )}
      </div>

      {!photos || photos.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {isOwner ? "No photos yet. Add your first photo!" : "No photos in gallery"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div
                className="aspect-square rounded-lg overflow-hidden cursor-pointer bg-muted"
                onClick={() => setSelectedPhoto(photo.photoUrl)}
              >
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || "Gallery photo"}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              {isOwner && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 shadow-lg"
                    onClick={() => setEditingCaption({ id: photo.id, caption: photo.caption || "" })}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 shadow-lg"
                    onClick={() => handleDelete(photo.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {photo.caption && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{photo.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Full size"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Caption Dialog */}
      <Dialog open={!!editingCaption} onOpenChange={() => setEditingCaption(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Caption</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editingCaption?.caption || ""}
              onChange={(e) =>
                setEditingCaption(
                  editingCaption ? { ...editingCaption, caption: e.target.value } : null
                )
              }
              placeholder="Add a caption for this photo..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingCaption(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCaption} disabled={updateCaptionMutation.isPending}>
                {updateCaptionMutation.isPending ? "Saving..." : "Save Caption"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
