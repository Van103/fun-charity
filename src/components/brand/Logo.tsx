import { motion } from "framer-motion";
import funCharityLogo from "@/assets/fun-charity-logo-clean.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = false, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 72, text: "text-lg" },
    md: { icon: 96, text: "text-xl" },
    lg: { icon: 120, text: "text-2xl" },
    xl: { icon: 160, text: "text-3xl" },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="relative"
        style={{ width: s.icon, height: s.icon }}
      >
        <img
          src={funCharityLogo}
          alt="FUN Charity Logo"
          className="w-full h-full object-contain"
        />
      </motion.div>

      {showText && (
        <motion.span 
          className={`font-display font-bold ${s.text} text-gold-shimmer tracking-tight whitespace-nowrap`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          FUNCHARITY
        </motion.span>
      )}
    </div>
  );
}
