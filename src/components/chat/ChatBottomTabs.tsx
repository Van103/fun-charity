import { motion } from "framer-motion";
import { MessageCircle, Camera, Bell, Menu, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

export type ChatTabType = "chats" | "stories" | "charity" | "notifications" | "menu";

interface ChatBottomTabsProps {
  activeTab: ChatTabType;
  onTabChange: (tab: ChatTabType) => void;
  unreadCounts?: {
    chats: number;
    notifications: number;
  };
}

const tabs = [
  { id: "chats" as ChatTabType, icon: MessageCircle, labelKey: "chat.chats" },
  { id: "stories" as ChatTabType, icon: Camera, labelKey: "chat.stories" },
  { id: "charity" as ChatTabType, icon: Heart, labelKey: "chat.charity" },
  { id: "notifications" as ChatTabType, icon: Bell, labelKey: "chat.notifications" },
  { id: "menu" as ChatTabType, icon: Menu, labelKey: "chat.menu" },
];

export function ChatBottomTabs({ activeTab, onTabChange, unreadCounts }: ChatBottomTabsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-around border-t border-border bg-card px-2 py-2 safe-area-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const unreadCount = tab.id === "chats" ? unreadCounts?.chats : 
                           tab.id === "notifications" ? unreadCounts?.notifications : 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center flex-1 py-1 relative"
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="chatTabIndicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-[#9333EA]"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            <motion.div
              whileTap={{ scale: 0.9 }}
              className="relative p-1.5"
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? "text-[#9333EA]" : "text-muted-foreground"
                }`}
                fill={isActive ? "#9333EA" : "none"}
                strokeWidth={isActive ? 0 : 2}
              />

              {/* Unread badge */}
              {unreadCount && unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              )}
            </motion.div>

            <span
              className={`text-[12px] mt-0.5 font-semibold transition-colors ${
                isActive ? "text-[#9333EA]" : "text-muted-foreground"
              }`}
            >
              {t(tab.labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
