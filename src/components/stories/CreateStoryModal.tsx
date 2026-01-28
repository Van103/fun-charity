import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Image as ImageIcon, Video, Type, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStoryModal({ isOpen, onClose, onSuccess }: CreateStoryModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setMediaFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!mediaFile) {
      toast({
        title: t('common.error'),
        description: "Please select an image or video",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload media
      const fileName = `story_${user.id}_${Date.now()}.${mediaFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("stories")
        .upload(fileName, mediaFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("stories")
        .getPublicUrl(fileName);

      // Create story (expires in 24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: insertError } = await supabase
        .from("chat_stories")
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: mediaType,
          caption: caption.trim() || null,
          duration: mediaType === 'video' ? 15 : 5,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) throw insertError;

      toast({
        title: t('stories.storyCreated') || 'Story Created!',
        description: t('stories.storyWillExpire') || 'Your story will expire in 24 hours',
      });

      // Reset form
      setCaption("");
      removeMedia();
      onSuccess();
    } catch (error) {
      console.error("Error creating story:", error);
      toast({
        title: t('common.error'),
        description: "Failed to create story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {t('stories.addStory') || 'Add Story'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Media preview or upload button */}
          {mediaPreview ? (
            <div className="relative aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden bg-black">
              {mediaType === 'video' ? (
                <video
                  src={mediaPreview}
                  className="w-full h-full object-contain"
                  controls
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeMedia}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[9/16] max-h-[400px] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-4 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="p-4 rounded-full bg-primary/10">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  {t('stories.selectMedia') || 'Tap to select image or video'}
                </p>
              </motion.button>
            </div>
          )}

          {/* Caption */}
          {mediaPreview && (
            <div className="space-y-2">
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t('stories.addCaption') || "Add a caption... (optional)"}
                className="resize-none"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {caption.length}/200
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !mediaFile}
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {t('stories.share') || 'Share Story'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
