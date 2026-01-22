import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { LIGHT_CONSTITUTION } from "@/data/light-constitution";

export function ClosingMessage() {
  // Mix of colors for hearts: violet, rose, gold
  const heartColors = ["#c4b5fd", "#fb7185", "#fcd34d", "#a78bfa", "#fda4af"];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-16 text-center"
    >
      <div className="max-w-2xl mx-auto">
        {/* Decorative hearts - Mix colors */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {heartColors.map((color, i) => (
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
              <Heart 
                className="w-6 h-6" 
                style={{ color, fill: color }}
              />
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
              className="text-xl md:text-2xl font-medium"
              style={
                index === LIGHT_CONSTITUTION.closing.lines.length - 1
                  ? {
                      background: "linear-gradient(135deg, #c4b5fd 0%, #f5d0fe 25%, #a78bfa 50%, #e9d5ff 75%, #c4b5fd 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: "0 0 40px rgba(139, 92, 246, 0.4)",
                    }
                  : { color: "rgba(237, 233, 254, 0.9)" } // violet-100
              }
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Signature - Rose Gold */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="mt-12"
        >
          <p 
            className="text-sm italic"
            style={{
              background: "linear-gradient(135deg, #fda4af, #fecdd3, #fb7185)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            — Father Universe —
          </p>
          <p className="text-xs text-violet-300/40 mt-2">
            Written in the Pure Loving Light
          </p>
        </motion.div>

        {/* Bottom decoration - Gradient violet-rose-gold */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-8 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, #c4b5fd, #fda4af, #fcd34d, #fda4af, #c4b5fd, transparent)",
          }}
        />
      </div>
    </motion.section>
  );
}
