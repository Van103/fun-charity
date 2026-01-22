import { motion } from "framer-motion";
import { FOUR_PILLARS } from "@/data/light-constitution";

export function FourPillars() {
  return (
    <section className="py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        {/* Section title - Warm Gold Gradient */}
        <h3 
          className="text-xl md:text-2xl font-bold mb-2"
          style={{
            background: "linear-gradient(135deg, #fcd34d 0%, #fef08a 50%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 0 30px rgba(251, 191, 36, 0.3)",
          }}
        >
          4 Trụ Cột Của Con Người FUN
        </h3>
        <p className="text-violet-200/60 text-sm italic">
          The Four Pillars of a FUN Human
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FOUR_PILLARS.map((pillar, index) => (
          <motion.div
            key={pillar.en}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group"
          >
            <div 
              className="relative h-full overflow-hidden rounded-2xl backdrop-blur-sm p-6 text-center transition-all duration-300 hover:shadow-xl"
              style={{
                background: "linear-gradient(180deg, rgba(26, 10, 46, 0.6), rgba(22, 8, 42, 0.4))",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              {/* Hover glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent, rgba(251, 113, 133, 0.05))",
                  boxShadow: "0 0 40px rgba(139, 92, 246, 0.2)",
                }}
              />
              
              {/* Icon with violet glow pulse */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5 
                }}
                className="text-4xl mb-4 relative"
              >
                {pillar.icon}
                <motion.div
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  className="absolute inset-0 blur-xl"
                  style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent)" }}
                />
              </motion.div>
              
              {/* Vietnamese title - Violet Luxury Gradient */}
              <h4 
                className="text-lg font-bold mb-1"
                style={{
                  background: "linear-gradient(135deg, #c4b5fd 0%, #f5d0fe 50%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {pillar.vi}
              </h4>
              
              {/* English title */}
              <p className="text-xs text-violet-300/50 uppercase tracking-wider mb-3">
                {pillar.en}
              </p>
              
              {/* Description */}
              <p className="text-xs text-violet-100/70 leading-relaxed">
                {pillar.description}
              </p>
              
              {/* Bottom glow - Rose Gold gradient */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "linear-gradient(90deg, transparent, #fda4af, #fb7185, #fda4af, transparent)",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
