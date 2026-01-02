import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/Logo";
import { ParticleButton } from "@/components/ui/ParticleButton";
import {
  ArrowRight,
  Heart,
  Users,
  Shield,
  Sparkles,
  TrendingUp,
  Globe,
  Wallet,
  Link as LinkIcon,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Yêu Thương Lan Tỏa", value: "$2.4M+", icon: TrendingUp },
  { label: "Ước Mơ Được Chắp Cánh", value: "1,200+", icon: Heart },
  { label: "Tấm Lòng Vàng", value: "45K+", icon: Users },
  { label: "Quốc Gia Kết Nối", value: "80+", icon: Globe },
];

const pillars = [
  {
    icon: Zap,
    title: "💞 Kết Nối Yêu Thương",
    description: "Mình kết nối những tấm lòng nhân ái với những hoàn cảnh cần giúp đỡ – tức thì, ấm áp",
  },
  {
    icon: Users,
    title: "🤝 Cộng Đồng Chia Sẻ",
    description: "Cùng nhau chia sẻ, động viên và lan tỏa những câu chuyện đẹp mỗi ngày",
  },
  {
    icon: LinkIcon,
    title: "✨ Minh Bạch Tuyệt Đối",
    description: "Mọi đồng tiền đều được ghi nhận rõ ràng – bạn yên tâm, người nhận được ấm lòng",
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-primary/60" />
      </div>
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(43_55%_52%_/_0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(275_60%_30%_/_0.3),_transparent_50%)]" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-light/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(201,162,61,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(201,162,61,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center mb-8">
            <Logo size="xl" showText={false} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Badge variant="gold" className="mb-6 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Nền Tảng Từ Thiện Minh Bạch 💛
            </Badge>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gold-shimmer">FUN Charity</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="text-lg md:text-xl text-primary-foreground/80 mb-4 max-w-3xl mx-auto italic">
            "Nơi mỗi tấm lòng đều được ghi nhận, mỗi sự giúp đỡ đều trong sáng và chạm đến trái tim."
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="text-lg md:text-xl slogan-glow mb-8">
            💖 Cho đi là hạnh phúc. Minh bạch là niềm tin. 💖
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/campaigns">
              <ParticleButton 
                variant="hero" 
                size="xl" 
                className="group glossy-btn glossy-btn-gradient"
                particleColors={['#84D9BA', '#FFD700', '#FF6B9D', '#00D4FF']}
                glowColor="#84D9BA"
              >
                <Heart className="w-5 h-5" fill="currentColor" />
                Lan Tỏa Yêu Thương
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </ParticleButton>
            </Link>
            <Link to="/auth">
              <ParticleButton 
                variant="wallet" 
                size="xl" 
                className="group glossy-btn glossy-btn-purple"
                particleColors={['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']}
                glowColor="#8B5CF6"
              >
                <Wallet className="w-5 h-5" />
                Đăng Ký / Đăng Nhập
              </ParticleButton>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="grid md:grid-cols-3 gap-4 mb-12">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div key={pillar.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }} className="bg-primary-foreground/10 backdrop-blur-sm border border-secondary/20 rounded-2xl p-6 text-left hover:border-secondary/40 transition-colors">
                  <Icon className="w-8 h-8 text-secondary mb-3" />
                  <h3 className="font-display font-semibold text-primary-foreground mb-2">{pillar.title}</h3>
                  <p className="text-sm text-primary-foreground/70">{pillar.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }} className="bg-primary-foreground/5 backdrop-blur-sm border border-secondary/10 rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <div className="font-display text-2xl font-bold text-secondary mb-1">{stat.value}</div>
                  <div className="text-xs text-primary-foreground/60">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 rounded-full border-2 border-secondary/50 flex items-start justify-center p-2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-secondary" />
        </div>
      </motion.div>
    </section>
  );
}
