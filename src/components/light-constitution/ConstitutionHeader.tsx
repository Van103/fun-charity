import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LIGHT_CONSTITUTION } from "@/data/light-constitution";

export function ConstitutionHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center py-12 md:py-16 relative"
    >
      {/* Decorative sun rays - Violet luxury */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="w-[500px] h-[500px] opacity-15"
          style={{
            background: `conic-gradient(from 0deg, transparent, #c4b5fd 10%, transparent 20%)`,
          }}
        />
      </div>

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main sun icon with violet glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.9, 1, 0.9]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative inline-block mb-6"
      >
        <div className="text-7xl md:text-8xl">☀️</div>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-violet-400/30 blur-xl" />
        </motion.div>
      </motion.div>

      {/* Title - Gradient Violet Luxury with shimmer */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-3xl md:text-5xl font-bold mb-4"
        style={{
          background: "linear-gradient(135deg, #c4b5fd 0%, #f5d0fe 25%, #a78bfa 50%, #e9d5ff 75%, #c4b5fd 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 0 60px rgba(139, 92, 246, 0.4)",
          animation: "shimmer-luxury 8s ease-in-out infinite",
        }}
      >
        {LIGHT_CONSTITUTION.title}
      </motion.h1>

      {/* Subtitle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 text-violet-200/70 mb-6"
      >
        <Sparkles className="w-4 h-4 text-violet-300" />
        <span className="italic">{LIGHT_CONSTITUTION.subtitle}</span>
        <Sparkles className="w-4 h-4 text-violet-300" />
      </motion.div>

      {/* Core principle badge - Rose Gold border */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="inline-block"
      >
        <div 
          className="relative overflow-hidden rounded-full backdrop-blur-sm px-8 py-4"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.3))",
            border: "2px solid transparent",
            backgroundImage: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2)), linear-gradient(135deg, #fda4af, #fb7185, #fda4af)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          {/* Deep Amethyst principle text */}
          <p 
            className="text-lg md:text-xl font-semibold"
            style={{
              background: "linear-gradient(135deg, #fcd34d 0%, #fef08a 50%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {LIGHT_CONSTITUTION.corePrinciple.vi}
          </p>
          <p className="text-xs text-rose-200/60 mt-1 italic">
            {LIGHT_CONSTITUTION.corePrinciple.en}
          </p>
          
          {/* Animated border glow - Violet */}
          <motion.div
            animate={{
              background: [
                "linear-gradient(90deg, transparent, #c4b5fd, transparent)",
                "linear-gradient(180deg, transparent, #c4b5fd, transparent)",
                "linear-gradient(270deg, transparent, #c4b5fd, transparent)",
                "linear-gradient(0deg, transparent, #c4b5fd, transparent)",
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 opacity-30 pointer-events-none"
          />
        </div>
      </motion.div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer-luxury {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </motion.header>
  );
}
