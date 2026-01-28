import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  X, Image as ImageIcon, Video, MapPin, Loader2, Sparkles,
  HandHeart, Gift, Users, Heart, Leaf, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShareDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { id: 'helping', icon: HandHeart, label: 'Helping Others', points: 15 },
  { id: 'donation', icon: Gift, label: 'Donation', points: 20 },
  { id: 'volunteer', icon: Users, label: 'Volunteering', points: 25 },
  { id: 'kindness', icon: Heart, label: 'Random Kindness', points: 10 },
  { id: 'environment', icon: Leaf, label: 'Environment', points: 15 },
  { id: 'other', icon: Star, label: 'Other', points: 10 },
];

const VISIBILITY_OPTIONS = [
  { id: 'public', label: 'Public - Everyone can see' },
  { id: 'friends', label: 'Friends only' },
  { id: 'private', label: 'Private - Only you' },
];

export function ShareDeedModal({ isOpen, onClose, onSuccess }: ShareDeedModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("kindness");
  const [visibility, setVisibility] = useState("public");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = CATEGORIES.find(c => c.id === category);
  const lightPoints = selectedCategory?.points || 10;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: t('common.error'),
        description: "Please add a title for your deed",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;

      // Upload image if present
      if (imageFile) {
        const fileName = `deed_${user.id}_${Date.now()}.${imageFile.name.split('.').pop()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create deed
      const { error } = await supabase
        .from("deeds")
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim() || null,
          category,
          visibility,
          location: location.trim() || null,
          image_url: imageUrl,
          light_points: lightPoints,
        });

      if (error) throw error;

      toast({
        title: "🌟 " + (t('charity.deedShared') || 'Deed Shared!'),
        description: `+${lightPoints} ${t('charity.lightPoints') || 'Light Points'}!`,
      });

      // Reset form
      setTitle("");
      setContent("");
      setCategory("kindness");
      setVisibility("public");
      setLocation("");
      removeImage();
      
      onSuccess();
    } catch (error) {
      console.error("Error sharing deed:", error);
      toast({
        title: t('common.error'),
        description: "Failed to share your deed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('charity.shareDeed') || 'Share Your Good Deed'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('charity.deedTitle') || "What good deed did you do?"}
              className="text-lg font-medium"
            />
          </div>

          {/* Content */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('charity.deedContent') || "Tell us more about your deed... (optional)"}
            className="min-h-[100px] resize-none"
          />

          {/* Category Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('charity.category') || 'Category'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      category === cat.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${category === cat.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium truncate w-full text-center">
                      {t(`charity.deedCategories.${cat.id}`) || cat.label}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      +{cat.points}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('charity.location') || "Add location (optional)"}
              className="pl-9"
            />
          </div>

          {/* Visibility */}
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue placeholder="Who can see this?" />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Light Points Preview */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="p-4 bg-primary/10 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">
                {t('charity.youWillEarn') || "You'll earn"}
              </span>
            </div>
            <Badge className="text-lg px-3 py-1 bg-primary text-primary-foreground">
              +{lightPoints} {t('charity.lightPoints') || 'Light Points'}
            </Badge>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Add Image */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>

            <div className="flex-1" />

            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim()}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {t('charity.shareDeed') || 'Share Deed'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
