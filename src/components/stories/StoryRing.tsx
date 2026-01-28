import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StoryRingProps {
  children: ReactNode;
  hasUnviewed: boolean;
  isOwn?: boolean;
}

export function StoryRing({ children, hasUnviewed, isOwn = false }: StoryRingProps) {
  if (isOwn) {
    // Own story - show gradient ring
    return (
      <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary via-purple-500 to-pink-500">
        {children}
      </div>
    );
  }

  if (hasUnviewed) {
    // Unviewed story - animated gradient ring
    return (
      <motion.div
        animate={{ 
          background: [
            "linear-gradient(45deg, hsl(var(--primary)), hsl(280, 80%, 60%), hsl(340, 80%, 60%))",
            "linear-gradient(135deg, hsl(var(--primary)), hsl(280, 80%, 60%), hsl(340, 80%, 60%))",
            "linear-gradient(225deg, hsl(var(--primary)), hsl(280, 80%, 60%), hsl(340, 80%, 60%))",
            "linear-gradient(315deg, hsl(var(--primary)), hsl(280, 80%, 60%), hsl(340, 80%, 60%))",
            "linear-gradient(45deg, hsl(var(--primary)), hsl(280, 80%, 60%), hsl(340, 80%, 60%))",
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="relative p-0.5 rounded-full"
      >
        {children}
      </motion.div>
    );
  }

  // Viewed story - gray ring
  return (
    <div className="relative p-0.5 rounded-full bg-muted-foreground/30">
      {children}
    </div>
  );
}
