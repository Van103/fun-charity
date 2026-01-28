import { motion } from "framer-motion";
import { Camera, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StoriesCarousel } from "@/components/stories/StoriesCarousel";

interface ChatStoriesTabProps {
  currentUserId?: string | null;
  currentUserProfile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function ChatStoriesTab({ currentUserId, currentUserProfile }: ChatStoriesTabProps) {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col">
      {/* Stories Carousel */}
      <div className="border-b border-border">
        <StoriesCarousel 
          currentUserId={currentUserId}
          currentUserProfile={currentUserProfile}
        />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4"
        >
          <Camera className="w-10 h-10 text-primary" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-bold text-foreground mb-2">
            {t('chat.storiesTitle') || 'Stories'}
          </h2>
          <p className="text-muted-foreground text-sm mb-4 max-w-xs">
            {t('chat.storiesDescription') || 'Share moments with your friends. Stories disappear after 24 hours.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
