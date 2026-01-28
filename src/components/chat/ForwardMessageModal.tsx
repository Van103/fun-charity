import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Forward, Loader2, Users, Image as ImageIcon, Video } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ForwardMessageModalProps {
  message: {
    id: string;
    content: string;
    image_url: string | null;
    sender_id: string;
    senderName?: string;
  };
  currentUserId: string;
  onClose: () => void;
}

interface ConversationItem {
  id: string;
  name: string;
  avatar_url: string | null;
  is_group: boolean;
  participant_id?: string;
}

// Helper to check if URL is video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

export function ForwardMessageModal({ message, currentUserId, onClose }: ForwardMessageModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      
      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
        .order("last_message_at", { ascending: false });

      if (!convos) {
        setIsLoading(false);
        return;
      }

      const items: ConversationItem[] = await Promise.all(
        convos.map(async (convo) => {
          if (convo.is_group) {
            return {
              id: convo.id,
              name: convo.name || t('messages.groupChat'),
              avatar_url: null,
              is_group: true,
            };
          }

          const otherUserId = convo.participant1_id === currentUserId 
            ? convo.participant2_id 
            : convo.participant1_id;

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", otherUserId)
            .maybeSingle();

          return {
            id: convo.id,
            name: profile?.full_name || t('messages.user'),
            avatar_url: profile?.avatar_url || null,
            is_group: false,
            participant_id: otherUserId,
          };
        })
      );

      setConversations(items);
      setFilteredConversations(items);
      setIsLoading(false);
    };

    loadConversations();
  }, [currentUserId, t]);

  // Filter conversations when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // Handle forward
  const handleForward = async () => {
    if (selectedIds.length === 0) return;

    setIsSending(true);

    try {
      // Insert message to each selected conversation
      const forwardPromises = selectedIds.map(async (convId) => {
        // Insert the forwarded message
        await supabase.from("messages").insert({
          conversation_id: convId,
          sender_id: currentUserId,
          content: message.content,
          image_url: message.image_url,
          is_read: false,
        });

        // Update conversation's last_message_at
        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", convId);
      });

      await Promise.all(forwardPromises);

      toast({
        title: t('messages.forwardSuccess') || "Đã chuyển tiếp",
        description: `${t('messages.forwardedTo') || "Đã gửi đến"} ${selectedIds.length} ${t('messages.conversations') || "cuộc hội thoại"}`,
      });

      onClose();
    } catch (error) {
      console.error("Forward error:", error);
      toast({
        title: t('common.error'),
        description: t('messages.forwardError') || "Không thể chuyển tiếp tin nhắn",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="w-5 h-5 text-primary" />
            {t('messages.forwardMessage') || "Chuyển tiếp tin nhắn"}
          </DialogTitle>
        </DialogHeader>

        {/* Message Preview */}
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground mb-1">
            {t('messages.messagePreview') || "Tin nhắn sẽ chuyển tiếp:"}
          </p>
          <div className="flex items-start gap-2">
            {message.image_url && (
              <div className="flex-shrink-0">
                {isVideoUrl(message.image_url) ? (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={message.image_url}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
            {message.content && (
              <p className="text-sm line-clamp-3 flex-1">{message.content}</p>
            )}
            {!message.content && message.image_url && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                {isVideoUrl(message.image_url) ? (
                  <>
                    <Video className="w-4 h-4" />
                    {t('messages.video') || "Video"}
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    {t('messages.image') || "Hình ảnh"}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('messages.searchConversations') || "Tìm kiếm cuộc hội thoại..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 min-h-0 max-h-64">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('messages.noConversationsFound') || "Không tìm thấy cuộc hội thoại"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((convo) => (
                <motion.button
                  key={convo.id}
                  onClick={() => toggleSelection(convo.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    selectedIds.includes(convo.id)
                      ? 'bg-primary/10'
                      : 'hover:bg-muted/50'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Checkbox
                    checked={selectedIds.includes(convo.id)}
                    className="pointer-events-none"
                  />
                  
                  {convo.is_group ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={convo.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {convo.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <span className="font-medium text-sm truncate flex-1 text-left">
                    {convo.name}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {selectedIds.length > 0 && (
              <span>{t('messages.selected') || "Đã chọn"}: {selectedIds.length}</span>
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              {t('common.cancel') || "Hủy"}
            </Button>
            <Button
              onClick={handleForward}
              disabled={selectedIds.length === 0 || isSending}
              className="min-w-[80px]"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Forward className="w-4 h-4 mr-1" />
                  {t('common.send') || "Gửi"} {selectedIds.length > 0 && `(${selectedIds.length})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
