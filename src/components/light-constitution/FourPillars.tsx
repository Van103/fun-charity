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
        <h3 className="text-xl md:text-2xl font-bold text-secondary mb-2">
          4 Trụ Cột Của Con Người FUN
        </h3>
        <p className="text-primary-foreground/60 text-sm italic">
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
            <div className="relative h-full overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-b from-primary/40 to-primary/20 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/10">
              {/* Icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5 
                }}
                className="text-4xl mb-4"
              >
                {pillar.icon}
              </motion.div>
              
              {/* Vietnamese title */}
              <h4 className="text-lg font-bold text-secondary mb-1">
                {pillar.vi}
              </h4>
              
              {/* English title */}
              <p className="text-xs text-primary-foreground/50 uppercase tracking-wider mb-3">
                {pillar.en}
              </p>
              
              {/* Description */}
              <p className="text-xs text-primary-foreground/70 leading-relaxed">
                {pillar.description}
              </p>
              
              {/* Bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
