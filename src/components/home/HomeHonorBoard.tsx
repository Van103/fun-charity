import { motion } from "framer-motion";
import { Users, Trophy, Heart, UserPlus, FileText, Video, Award, Coins, Gift } from "lucide-react";
import { useHomeHonorStats } from "@/hooks/useHomeHonorStats";
import { useCountAnimation } from "@/hooks/useCountAnimation";

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(".", ",") + "M";
  }
  if (num >= 1000) {
    return num.toLocaleString("vi-VN");
  }
  return num.toString();
};

interface StatCellProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  delay: number;
}

const StatCell = ({ icon, label, value, delay }: StatCellProps) => {
  const numericValue = typeof value === "number" ? value : 0;
  const animatedValue = useCountAnimation(numericValue, 2000);
  const displayValue = typeof value === "string" ? value : formatNumber(animatedValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="metal-gold-border flex items-center gap-3 px-4 py-2.5 min-w-[140px]"
    >
      <div className="text-purple-600 flex-shrink-0">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wide text-purple-500 font-medium">
          {label}
        </span>
        <span className="text-sm font-bold text-purple-800">{displayValue}</span>
      </div>
    </motion.div>
  );
};

const HomeHonorBoard = () => {
  const { data: stats, isLoading } = useHomeHonorStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse flex gap-4">
          <div className="metal-gold-border-button w-28 h-24 bg-amber-100/50" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="metal-gold-border w-36 h-12 bg-amber-100/50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    { icon: <Trophy size={18} />, label: "Top Charity", value: stats?.topCharityRank || "1/1" },
    { icon: <Heart size={18} />, label: "Charity Giving", value: stats?.charityGiving || 0 },
    { icon: <UserPlus size={18} />, label: "Friends", value: stats?.friends || 0 },
    { icon: <FileText size={18} />, label: "Posts", value: stats?.posts || 0 },
    { icon: <Video size={18} />, label: "Videos", value: stats?.videos || 0 },
    { icon: <Award size={18} />, label: "Số NFT", value: stats?.nftCount || 0 },
    { icon: <Coins size={18} />, label: "Claimed", value: stats?.claimed || 0 },
    { icon: <Gift size={18} />, label: "Total Reward", value: stats?.totalReward || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 py-6 px-4"
    >
      {/* Users Button - Left Side */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        className="metal-gold-border-button flex flex-col items-center justify-center px-6 py-4 cursor-pointer"
      >
        <Users className="text-purple-700 mb-1" size={28} />
        <span className="text-2xl font-bold text-purple-800">
          {formatNumber(stats?.totalUsers || 0)}
        </span>
        <span className="text-xs uppercase tracking-wider text-purple-600 font-medium">
          Users
        </span>
      </motion.div>

      {/* Stats Grid - Right Side */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-3">
        {statsData.map((stat, index) => (
          <StatCell
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            delay={0.3 + index * 0.05}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default HomeHonorBoard;
