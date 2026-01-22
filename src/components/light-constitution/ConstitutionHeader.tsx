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
      {/* Decorative sun rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="w-[500px] h-[500px] opacity-10"
          style={{
            background: `conic-gradient(from 0deg, transparent, hsl(var(--secondary)) 10%, transparent 20%)`,
          }}
        />
      </div>

      {/* Main sun icon */}
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
          <div className="w-24 h-24 rounded-full bg-secondary/30 blur-xl" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-3xl md:text-5xl font-bold mb-4"
        style={{
          background: "linear-gradient(135deg, hsl(var(--secondary)) 0%, #FFD700 50%, hsl(var(--secondary)) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 0 40px hsla(var(--secondary), 0.3)",
        }}
      >
        {LIGHT_CONSTITUTION.title}
      </motion.h1>

      {/* Subtitle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 text-primary-foreground/70 mb-6"
      >
        <Sparkles className="w-4 h-4 text-secondary" />
        <span className="italic">{LIGHT_CONSTITUTION.subtitle}</span>
        <Sparkles className="w-4 h-4 text-secondary" />
      </motion.div>

      {/* Core principle badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="inline-block"
      >
        <div className="relative overflow-hidden rounded-full border-2 border-secondary/50 bg-gradient-to-r from-primary/60 via-primary/40 to-primary/60 backdrop-blur-sm px-8 py-4">
          <p className="text-lg md:text-xl font-semibold text-secondary">
            {LIGHT_CONSTITUTION.corePrinciple.vi}
          </p>
          <p className="text-xs text-primary-foreground/60 mt-1 italic">
            {LIGHT_CONSTITUTION.corePrinciple.en}
          </p>
          
          {/* Animated border glow */}
          <motion.div
            animate={{
              background: [
                "linear-gradient(90deg, transparent, hsl(var(--secondary)), transparent)",
                "linear-gradient(180deg, transparent, hsl(var(--secondary)), transparent)",
                "linear-gradient(270deg, transparent, hsl(var(--secondary)), transparent)",
                "linear-gradient(0deg, transparent, hsl(var(--secondary)), transparent)",
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 opacity-20 pointer-events-none"
          />
        </div>
      </motion.div>
    </motion.header>
  );
}
