import { motion } from "framer-motion";
import { Camera, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function ChatStoriesTab() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4"
      >
        <Camera className="w-12 h-12 text-primary" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t('chat.storiesTitle')}
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xs">
          {t('chat.storiesDescription')}
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium"
        >
          <Plus className="w-5 h-5" />
          {t('chat.createStory')}
        </motion.button>
      </motion.div>
    </div>
  );
}
