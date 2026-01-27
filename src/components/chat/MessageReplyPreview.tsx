import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ReplyMessage {
  id: string;
  content: string;
  sender_id: string;
  senderName?: string;
  image_url?: string | null;
}

interface MessageReplyPreviewProps {
  replyTo: ReplyMessage;
  currentUserId: string;
  onCancel: () => void;
}

export function MessageReplyPreview({
  replyTo,
  currentUserId,
  onCancel,
}: MessageReplyPreviewProps) {
  const isOwnMessage = replyTo.sender_id === currentUserId;
  const senderDisplay = isOwnMessage ? "Bạn" : replyTo.senderName || "Người dùng";
  
  // Truncate long content
  const truncatedContent = replyTo.content.length > 100 
    ? replyTo.content.substring(0, 100) + "..." 
    : replyTo.content;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-border bg-muted/30 px-4 py-2"
    >
      <div className="flex items-start gap-3 max-w-4xl mx-auto">
        {/* Reply indicator bar */}
        <div className="w-1 h-full min-h-[2.5rem] bg-primary rounded-full shrink-0" />
        
        {/* Reply content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary mb-0.5">
            Đang trả lời {senderDisplay}
          </p>
          <div className="flex items-center gap-2">
            {replyTo.image_url && (
              <img 
                src={replyTo.image_url} 
                alt="Reply attachment" 
                className="w-10 h-10 object-cover rounded"
              />
            )}
            <p className="text-sm text-muted-foreground line-clamp-1">
              {replyTo.content || (replyTo.image_url ? "📷 Hình ảnh" : "")}
            </p>
          </div>
        </div>
        
        {/* Cancel button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8 shrink-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// Component to display replied message inside a message bubble
interface ReplyQuoteProps {
  replyTo: ReplyMessage;
  currentUserId: string;
  onClick?: () => void;
}

export function ReplyQuote({ replyTo, currentUserId, onClick }: ReplyQuoteProps) {
  const isOwnMessage = replyTo.sender_id === currentUserId;
  const senderDisplay = isOwnMessage ? "Bạn" : replyTo.senderName || "Người dùng";
  
  const truncatedContent = replyTo.content.length > 60 
    ? replyTo.content.substring(0, 60) + "..." 
    : replyTo.content;

  return (
    <button
      onClick={onClick}
      className="w-full text-left mb-1 p-2 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 transition-colors"
    >
      <div className="flex items-start gap-2">
        <div className="w-0.5 h-full min-h-[1.5rem] bg-white/50 rounded-full shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium opacity-80 mb-0.5">
            {senderDisplay}
          </p>
          <div className="flex items-center gap-2">
            {replyTo.image_url && (
              <img 
                src={replyTo.image_url} 
                alt="Reply attachment" 
                className="w-8 h-8 object-cover rounded opacity-80"
              />
            )}
            <p className="text-xs opacity-70 line-clamp-1">
              {replyTo.content || (replyTo.image_url ? "📷 Hình ảnh" : "")}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
