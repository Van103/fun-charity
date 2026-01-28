import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Search, Plus, Sparkles, Users, Star, 
  HandHeart, Leaf, GraduationCap, Building2, AlertTriangle, Baby
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { DeedCard } from "@/components/charity/DeedCard";
import { LightPointsCard } from "@/components/charity/LightPointsCard";
import { ChannelCard } from "@/components/charity/ChannelCard";
import { ShareDeedModal } from "@/components/charity/ShareDeedModal";
import { useDeeds } from "@/hooks/useDeeds";
import { useCharityChannels } from "@/hooks/useCharityChannels";
import { useLightPoints } from "@/hooks/useLightPoints";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  education: GraduationCap,
  health: Heart,
  environment: Leaf,
  community: Building2,
  disaster: AlertTriangle,
  children: Baby,
};

export function CharityGlobalTab() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showShareDeedModal, setShowShareDeedModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { deeds, isLoading: deedsLoading, refetchDeeds } = useDeeds();
  const { channels, isLoading: channelsLoading } = useCharityChannels();
  const { lightPoints, rank, isLoading: pointsLoading } = useLightPoints();

  const categories = [
    { id: 'education', label: t('charity.deedCategories.education') || 'Education', icon: GraduationCap },
    { id: 'health', label: t('charity.deedCategories.health') || 'Health', icon: Heart },
    { id: 'environment', label: t('charity.deedCategories.environment') || 'Environment', icon: Leaf },
    { id: 'community', label: t('charity.deedCategories.community') || 'Community', icon: Building2 },
  ];

  const filteredDeeds = deeds.filter(deed => {
    const matchesSearch = !searchQuery || 
      deed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deed.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || deed.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredChannels = channels.filter(c => c.is_official).slice(0, 4);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </motion.div>
            <h1 className="text-xl font-bold text-foreground">
              {t('charity.globalHub') || 'Charity Global Hub'}
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('charity.searchDeeds') || 'Search good deeds...'}
            className="pl-9"
          />
        </div>

        {/* Light Points Summary */}
        <LightPointsCard 
          points={lightPoints} 
          rank={rank} 
          isLoading={pointsLoading}
          compact
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Featured Channels */}
          {featuredChannels.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                {t('charity.featuredChannels') || 'Featured Channels'}
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {featuredChannels.map((channel) => (
                  <ChannelCard 
                    key={channel.id} 
                    channel={channel}
                    compact
                  />
                ))}
              </div>
            </section>
          )}

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Badge
              variant={activeCategory === null ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setActiveCategory(null)}
            >
              {t('common.all') || 'All'}
            </Badge>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Badge
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap flex items-center gap-1"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <Icon className="h-3 w-3" />
                  {cat.label}
                </Badge>
              );
            })}
          </div>

          {/* Deeds Feed - Lan Tỏa Ánh Sáng */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <HandHeart className="h-4 w-4 text-primary" />
              {t('charity.spreadLight') || 'Lan Tỏa Ánh Sáng'}
            </h2>

            <AnimatePresence mode="popLayout">
              {deedsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-muted rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : filteredDeeds.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {t('charity.noDeeds') || 'No good deeds yet. Be the first to share!'}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredDeeds.map((deed, index) => (
                    <motion.div
                      key={deed.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DeedCard deed={deed} onUpdate={refetchDeeds} />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </ScrollArea>

      {/* FAB - Share Deed Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute bottom-20 right-4 md:bottom-6"
      >
        <Button
          size="lg"
          onClick={() => setShowShareDeedModal(true)}
          className="rounded-full shadow-lg h-14 px-6 gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">{t('charity.shareDeed') || 'Share Deed'}</span>
        </Button>
      </motion.div>

      {/* Share Deed Modal */}
      <ShareDeedModal
        isOpen={showShareDeedModal}
        onClose={() => setShowShareDeedModal(false)}
        onSuccess={() => {
          refetchDeeds();
          setShowShareDeedModal(false);
        }}
      />
    </div>
  );
}
