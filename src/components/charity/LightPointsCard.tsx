import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Award, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface LightPointsCardProps {
  points: number;
  rank: string;
  weeklyPoints?: number;
  monthlyPoints?: number;
  deedsCount?: number;
  isLoading?: boolean;
  compact?: boolean;
}

const RANK_CONFIG: Record<string, { color: string; icon: React.ElementType; nextRank: string; pointsNeeded: number }> = {
  Beginner: { color: 'bg-slate-500', icon: Star, nextRank: 'Helper', pointsNeeded: 100 },
  Helper: { color: 'bg-blue-500', icon: Star, nextRank: 'Hero', pointsNeeded: 1000 },
  Hero: { color: 'bg-purple-500', icon: Award, nextRank: 'Champion', pointsNeeded: 5000 },
  Champion: { color: 'bg-amber-500', icon: Award, nextRank: 'Legend', pointsNeeded: 10000 },
  Legend: { color: 'bg-gradient-to-r from-amber-400 to-orange-500', icon: Sparkles, nextRank: 'Legend', pointsNeeded: 10000 },
};

export function LightPointsCard({ 
  points, 
  rank, 
  weeklyPoints = 0, 
  monthlyPoints = 0,
  deedsCount = 0,
  isLoading,
  compact = false
}: LightPointsCardProps) {
  const { t } = useLanguage();
  
  const rankConfig = RANK_CONFIG[rank] || RANK_CONFIG.Beginner;
  const RankIcon = rankConfig.icon;
  
  // Calculate progress to next rank
  const prevRankPoints = rank === 'Beginner' ? 0 : 
    rank === 'Helper' ? 100 : 
    rank === 'Hero' ? 1000 : 
    rank === 'Champion' ? 5000 : 10000;
  
  const progressToNext = rank === 'Legend' 
    ? 100 
    : Math.min(100, ((points - prevRankPoints) / (rankConfig.pointsNeeded - prevRankPoints)) * 100);

  if (isLoading) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-card border border-border rounded-xl animate-pulse`}>
        <div className="h-12 bg-muted rounded" />
      </div>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`p-2 rounded-full ${rankConfig.color} text-white`}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                {points.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('charity.lightPoints') || 'Light Points'}
              </span>
            </div>
          </div>
        </div>
        
        <Badge className={`${rankConfig.color} text-white border-0`}>
          <RankIcon className="h-3 w-3 mr-1" />
          {rank}
        </Badge>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className={`p-3 rounded-full ${rankConfig.color} text-white shadow-lg`}
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('charity.lightPoints') || 'Light Points'}
            </h3>
            <p className="text-2xl font-bold text-foreground">
              {points.toLocaleString()}
            </p>
          </div>
        </div>
        
        <Badge className={`${rankConfig.color} text-white border-0 text-sm px-3 py-1`}>
          <RankIcon className="h-4 w-4 mr-1" />
          {rank}
        </Badge>
      </div>

      {/* Progress to next rank */}
      {rank !== 'Legend' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('charity.progressToNext') || 'Progress to'} {rankConfig.nextRank}</span>
            <span>{Math.round(progressToNext)}%</span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 bg-card/50 rounded-lg">
          <p className="text-lg font-semibold text-foreground">{deedsCount}</p>
          <p className="text-xs text-muted-foreground">{t('charity.deeds') || 'Deeds'}</p>
        </div>
        <div className="text-center p-2 bg-card/50 rounded-lg">
          <p className="text-lg font-semibold text-foreground">+{weeklyPoints}</p>
          <p className="text-xs text-muted-foreground">{t('common.thisWeek') || 'This Week'}</p>
        </div>
        <div className="text-center p-2 bg-card/50 rounded-lg">
          <p className="text-lg font-semibold text-foreground">+{monthlyPoints}</p>
          <p className="text-xs text-muted-foreground">{t('common.thisMonth') || 'This Month'}</p>
        </div>
      </div>
    </motion.div>
  );
}
