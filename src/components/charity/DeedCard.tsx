import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Heart, Star, MessageCircle, Share2, Sparkles,
  HandHeart, Leaf, Gift, Users, MoreVertical, MapPin
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";

interface Deed {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  category: string | null;
  location: string | null;
  light_points: number;
  is_verified: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  reactions_count?: number;
  comments_count?: number;
  user_reaction?: string | null;
}

interface DeedCardProps {
  deed: Deed;
  onUpdate?: () => void;
}

const REACTION_TYPES = [
  { type: 'heart', icon: Heart, label: 'Love', color: 'text-red-500' },
  { type: 'star', icon: Star, label: 'Amazing', color: 'text-yellow-500' },
  { type: 'pray', icon: HandHeart, label: 'Pray', color: 'text-purple-500' },
  { type: 'inspire', icon: Sparkles, label: 'Inspiring', color: 'text-blue-500' },
  { type: 'grateful', icon: Gift, label: 'Grateful', color: 'text-green-500' },
];

const CATEGORY_INFO: Record<string, { icon: React.ElementType; color: string }> = {
  helping: { icon: HandHeart, color: 'bg-blue-500/10 text-blue-500' },
  donation: { icon: Gift, color: 'bg-green-500/10 text-green-500' },
  volunteer: { icon: Users, color: 'bg-purple-500/10 text-purple-500' },
  kindness: { icon: Heart, color: 'bg-pink-500/10 text-pink-500' },
  environment: { icon: Leaf, color: 'bg-emerald-500/10 text-emerald-500' },
  other: { icon: Star, color: 'bg-yellow-500/10 text-yellow-500' },
};

export function DeedCard({ deed, onUpdate }: DeedCardProps) {
  const { t, language } = useLanguage();
  const [showReactions, setShowReactions] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(deed.user_reaction);
  const [reactionsCount, setReactionsCount] = useState(deed.reactions_count || 0);

  const dateLocale = language === 'vi' ? vi : enUS;
  const categoryInfo = CATEGORY_INFO[deed.category || 'other'] || CATEGORY_INFO.other;
  const CategoryIcon = categoryInfo.icon;

  const handleReaction = async (reactionType: string) => {
    setIsReacting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (currentReaction === reactionType) {
        // Remove reaction
        await supabase
          .from("deed_reactions")
          .delete()
          .eq("deed_id", deed.id)
          .eq("user_id", user.id);
        setCurrentReaction(null);
        setReactionsCount(prev => Math.max(0, prev - 1));
      } else {
        // Add or update reaction
        await supabase
          .from("deed_reactions")
          .upsert({
            deed_id: deed.id,
            user_id: user.id,
            reaction_type: reactionType
          }, { onConflict: 'deed_id,user_id' });
        
        if (!currentReaction) {
          setReactionsCount(prev => prev + 1);
        }
        setCurrentReaction(reactionType);
      }
      setShowReactions(false);
    } catch (error) {
      console.error("Error reacting to deed:", error);
    } finally {
      setIsReacting(false);
    }
  };

  const CurrentReactionIcon = currentReaction 
    ? REACTION_TYPES.find(r => r.type === currentReaction)?.icon || Heart
    : Heart;

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={deed.profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {deed.profile?.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground truncate">
              {deed.profile?.full_name || 'Anonymous'}
            </span>
            {deed.is_verified && (
              <Badge variant="secondary" className="text-xs">
                ✓ Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(deed.created_at), { 
                addSuffix: true, 
                locale: dateLocale 
              })}
            </span>
            {deed.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {deed.location}
                </span>
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              {t('common.share') || 'Share'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h3 className="font-semibold text-foreground mb-1">{deed.title}</h3>
        {deed.content && (
          <p className="text-sm text-muted-foreground line-clamp-3">{deed.content}</p>
        )}
      </div>

      {/* Category & Points */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <Badge variant="secondary" className={`${categoryInfo.color} border-0`}>
          <CategoryIcon className="h-3 w-3 mr-1" />
          {t(`charity.deedCategories.${deed.category}`) || deed.category}
        </Badge>
        <Badge variant="outline" className="text-primary border-primary/30">
          <Sparkles className="h-3 w-3 mr-1" />
          +{deed.light_points} {t('charity.lightPoints') || 'Light Points'}
        </Badge>
      </div>

      {/* Image */}
      {deed.image_url && (
        <div className="relative">
          <img
            src={deed.image_url}
            alt={deed.title}
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}

      {/* Video */}
      {deed.video_url && (
        <div className="relative">
          <video
            src={deed.video_url}
            controls
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-3 border-t border-border flex items-center gap-2">
        {/* Reaction button with popup */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 ${currentReaction ? 'text-primary' : ''}`}
            onClick={() => currentReaction ? handleReaction(currentReaction) : setShowReactions(!showReactions)}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 200)}
            disabled={isReacting}
          >
            <CurrentReactionIcon className={`h-4 w-4 ${currentReaction ? 'fill-current' : ''}`} />
            <span>{reactionsCount}</span>
          </Button>

          {/* Reaction picker */}
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-full left-0 mb-2 p-2 bg-card border border-border rounded-full shadow-lg flex gap-1 z-10"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              {REACTION_TYPES.map((reaction) => {
                const Icon = reaction.icon;
                return (
                  <motion.button
                    key={reaction.type}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(reaction.type)}
                    className={`p-2 rounded-full hover:bg-muted ${reaction.color}`}
                    title={reaction.label}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>

        <Button variant="ghost" size="sm" className="gap-1.5">
          <MessageCircle className="h-4 w-4" />
          <span>{deed.comments_count || 0}</span>
        </Button>

        <Button variant="ghost" size="sm" className="gap-1.5 ml-auto">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.share') || 'Share'}</span>
        </Button>
      </div>
    </motion.div>
  );
}
