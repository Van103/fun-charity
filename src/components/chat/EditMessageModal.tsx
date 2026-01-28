import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface EditMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  currentContent: string;
  onSuccess: () => void;
}

export function EditMessageModal({ 
  isOpen, 
  onClose, 
  messageId, 
  currentContent,
  onSuccess 
}: EditMessageModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [content, setContent] = useState(currentContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: t('common.error'),
        description: t('messages.emptyMessage'),
        variant: "destructive"
      });
      return;
    }

    if (content === currentContent) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("messages")
        .update({
          content: content.trim(),
          is_edited: true,
          edited_at: new Date().toISOString(),
          original_content: currentContent
        })
        .eq("id", messageId);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('chat.messageEdited'),
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error editing message:", error);
      toast({
        title: t('common.error'),
        description: t('chat.editFailed'),
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
            {t('chat.editMessage')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('messages.typeMessage')}
            className="min-h-[100px] resize-none"
            autoFocus
          />
          
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {t('chat.saveChanges')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility function to check if message can be edited (within 30 minutes)
export function canEditMessage(createdAt: string, senderId: string, currentUserId: string | null): boolean {
  if (!currentUserId || senderId !== currentUserId) return false;
  
  const messageTime = new Date(createdAt).getTime();
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  return now - messageTime < thirtyMinutes;
}
