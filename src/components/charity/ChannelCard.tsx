import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Star, Check, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
  member_count: number;
  is_official: boolean;
  is_member?: boolean;
}

interface ChannelCardProps {
  channel: Channel;
  compact?: boolean;
  onJoinLeave?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  education: 'bg-blue-500/10 text-blue-500',
  health: 'bg-red-500/10 text-red-500',
  environment: 'bg-green-500/10 text-green-500',
  community: 'bg-purple-500/10 text-purple-500',
  disaster: 'bg-orange-500/10 text-orange-500',
  children: 'bg-pink-500/10 text-pink-500',
};

export function ChannelCard({ channel, compact = false, onJoinLeave }: ChannelCardProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isJoined, setIsJoined] = useState(channel.is_member || false);
  const [isLoading, setIsLoading] = useState(false);
  const [memberCount, setMemberCount] = useState(channel.member_count);

  const handleJoinLeave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('common.error'),
          description: "Please login to join channels",
          variant: "destructive"
        });
        return;
      }

      if (isJoined) {
        // Leave channel
        await supabase
          .from("charity_channel_members")
          .delete()
          .eq("channel_id", channel.id)
          .eq("user_id", user.id);
        
        setIsJoined(false);
        setMemberCount(prev => Math.max(0, prev - 1));
        toast({
          description: `Left ${channel.name}`,
        });
      } else {
        // Join channel
        await supabase
          .from("charity_channel_members")
          .insert({
            channel_id: channel.id,
            user_id: user.id,
            role: 'member'
          });
        
        setIsJoined(true);
        setMemberCount(prev => prev + 1);
        toast({
          description: `Joined ${channel.name}!`,
        });
      }

      onJoinLeave?.();
    } catch (error) {
      console.error("Error joining/leaving channel:", error);
      toast({
        title: t('common.error'),
        description: "Failed to update membership",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categoryColor = CATEGORY_COLORS[channel.category || ''] || 'bg-gray-500/10 text-gray-500';

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="min-w-[160px] p-3 bg-card border border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
      >
        {/* Cover Image or Placeholder */}
        <div className="relative h-16 rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-primary/20 to-primary/5">
          {channel.cover_image_url ? (
            <img
              src={channel.cover_image_url}
              alt={channel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="h-8 w-8 text-primary/50" />
            </div>
          )}
          {channel.is_official && (
            <Badge className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5">
              <Star className="h-2.5 w-2.5 mr-0.5" />
              Official
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-sm text-foreground truncate mb-1">
          {channel.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {memberCount.toLocaleString()}
          </span>
          
          <Button
            size="sm"
            variant={isJoined ? "secondary" : "default"}
            className="h-6 text-xs px-2"
            onClick={(e) => {
              e.stopPropagation();
              handleJoinLeave();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isJoined ? (
              <Check className="h-3 w-3" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
        {channel.cover_image_url ? (
          <img
            src={channel.cover_image_url}
            alt={channel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="h-12 w-12 text-primary/30" />
          </div>
        )}
        {channel.is_official && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            <Star className="h-3 w-3 mr-1" />
            Official
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">{channel.name}</h3>
          {channel.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {channel.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {channel.category && (
            <Badge variant="secondary" className={`${categoryColor} border-0`}>
              {t(`charity.categories.${channel.category}`) || channel.category}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="h-4 w-4" />
            {memberCount.toLocaleString()} {t('charity.members') || 'members'}
          </span>
        </div>

        <Button
          className="w-full"
          variant={isJoined ? "secondary" : "default"}
          onClick={handleJoinLeave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isJoined ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              {t('charity.joined') || 'Joined'}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {t('charity.joinChannel') || 'Join Channel'}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
