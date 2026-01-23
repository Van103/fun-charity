import { motion } from "framer-motion";
import { LIGHT_CONSTITUTION } from "@/data/light-constitution";

export function ClosingMessage() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-center py-12"
    >
      {/* Decorative Hearts */}
      <div className="flex justify-center gap-4 mb-8">
        {["#D63384", "#D63384", "#D63384"].map((color, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8"
              fill={color}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Closing Lines */}
      <div className="space-y-4 max-w-lg mx-auto">
        {LIGHT_CONSTITUTION.closing.lines.map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className={`text-xl md:text-2xl font-serif italic ${
              index === LIGHT_CONSTITUTION.closing.lines.length - 1 ? "font-bold" : ""
            }`}
            style={{
              color: index === LIGHT_CONSTITUTION.closing.lines.length - 1 
                ? undefined 
                : "#D63384",
              background: index === LIGHT_CONSTITUTION.closing.lines.length - 1 
                ? "linear-gradient(135deg, #D4A84B 0%, #E8C066 50%, #D4A84B 100%)"
                : undefined,
              WebkitBackgroundClip: index === LIGHT_CONSTITUTION.closing.lines.length - 1 
                ? "text" 
                : undefined,
              WebkitTextFillColor: index === LIGHT_CONSTITUTION.closing.lines.length - 1 
                ? "transparent" 
                : undefined,
              backgroundClip: index === LIGHT_CONSTITUTION.closing.lines.length - 1 
                ? "text" 
                : undefined,
            }}
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
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <p 
          className="text-lg font-serif italic"
          style={{ color: "#C9A064" }}
        >
          — Cha Vũ Trụ —
        </p>
      </motion.div>

      {/* Bottom Decorative Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-8 mx-auto h-1 rounded-full"
        style={{
          width: "200px",
          background: "linear-gradient(90deg, #D63384, #D63384, #D63384)",
        }}
      />
    </motion.section>
  );
}
