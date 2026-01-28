import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, MessageCircle, Phone, Video, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";

interface ChatNotification {
  id: string;
  type: "message" | "missed_call" | "friend_request";
  sender: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  content?: string;
  callType?: "video" | "audio";
  created_at: string;
  is_read: boolean;
}

interface ChatNotificationsTabProps {
  currentUserId: string | null;
  onSelectConversation?: (userId: string) => void;
}

export function ChatNotificationsTab({ currentUserId, onSelectConversation }: ChatNotificationsTabProps) {
  const { t, language } = useLanguage();
  const dateLocale = language === "vi" ? vi : enUS;
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentUserId) return;

      // Load unread messages as notifications
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_id
        `)
        .eq("is_read", false)
        .neq("sender_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(20);

      // Get sender profiles
      const senderIds = [...new Set(unreadMessages?.map(m => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", senderIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Load missed calls
      const { data: missedCalls } = await supabase
        .from("call_sessions")
        .select("*")
        .neq("caller_id", currentUserId)
        .eq("status", "missed")
        .order("started_at", { ascending: false })
        .limit(10);

      // Get caller profiles for missed calls
      const callerIds = [...new Set(missedCalls?.map(c => c.caller_id) || [])];
      const { data: callerProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", callerIds);

      const callerProfileMap = new Map(callerProfiles?.map(p => [p.user_id, p]) || []);

      const messageNotifs: ChatNotification[] = (unreadMessages || []).map(msg => ({
        id: msg.id,
        type: "message" as const,
        sender: profileMap.get(msg.sender_id) || { 
          user_id: msg.sender_id, 
          full_name: null, 
          avatar_url: null 
        },
        content: msg.content,
        created_at: msg.created_at,
        is_read: msg.is_read || false,
      }));

      const callNotifs: ChatNotification[] = (missedCalls || []).map(call => ({
        id: call.id,
        type: "missed_call" as const,
        sender: callerProfileMap.get(call.caller_id) || { 
          user_id: call.caller_id, 
          full_name: null, 
          avatar_url: null 
        },
        callType: call.call_type as "video" | "audio",
        created_at: call.started_at,
        is_read: false,
      }));

      setNotifications([...messageNotifs, ...callNotifs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      setIsLoading(false);
    };

    loadNotifications();
  }, [currentUserId]);

  const getNotificationIcon = (type: string, callType?: string) => {
    if (type === "missed_call") {
      return callType === "video" ? Video : Phone;
    }
    return MessageCircle;
  };

  const getNotificationText = (notification: ChatNotification) => {
    if (notification.type === "missed_call") {
      return notification.callType === "video" 
        ? t('chat.missedVideoCall') 
        : t('chat.missedAudioCall');
    }
    return notification.content?.substring(0, 50) + (notification.content && notification.content.length > 50 ? "..." : "");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4"
        >
          <Bell className="w-12 h-12 text-primary" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t('chat.noNotifications')}
        </h2>
        <p className="text-muted-foreground max-w-xs">
          {t('chat.noNotificationsDescription')}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-2">
        <h2 className="font-semibold text-lg mb-3">{t('chat.notifications')}</h2>
        
        {notifications.map((notification, index) => {
          const Icon = getNotificationIcon(notification.type, notification.callType);
          
          return (
            <motion.button
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectConversation?.(notification.sender.user_id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                notification.is_read ? "bg-muted/30" : "bg-primary/5 hover:bg-primary/10"
              }`}
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={notification.sender.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {notification.sender.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${
                  notification.type === "missed_call" ? "bg-destructive" : "bg-primary"
                }`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {notification.sender.full_name || t('messages.user')}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {getNotificationText(notification)}
                </p>
              </div>
              
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true, 
                  locale: dateLocale 
                })}
              </span>
              
              {!notification.is_read && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
