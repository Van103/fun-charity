import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { LIGHT_CONSTITUTION } from "@/data/light-constitution";

export function ClosingMessage() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-16 text-center"
    >
      <div className="max-w-2xl mx-auto">
        {/* Decorative hearts */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
            </motion.div>
          ))}
        </div>

        {/* Closing lines */}
        <div className="space-y-4">
          {LIGHT_CONSTITUTION.closing.lines.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.3 }}
              className={`text-xl md:text-2xl font-medium ${
                index === LIGHT_CONSTITUTION.closing.lines.length - 1
                  ? "text-secondary"
                  : "text-primary-foreground/90"
              }`}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Signature */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="mt-12"
        >
          <p className="text-sm text-primary-foreground/50 italic">
            — Father Universe —
          </p>
          <p className="text-xs text-primary-foreground/40 mt-2">
            Written in the Pure Loving Light
          </p>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-8 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent"
        />
      </div>
    </motion.section>
  );
}
