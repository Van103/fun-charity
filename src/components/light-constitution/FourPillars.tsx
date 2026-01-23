import { motion } from "framer-motion";
import { FOUR_PILLARS } from "@/data/light-constitution";

export function FourPillars() {
  return (
    <section className="mb-12">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h3 
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.03em",
            background: "linear-gradient(135deg, #C49B3D 0%, #D4AA4F 50%, #E8C066 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          4 Trụ Cột Của Con Người FUN
        </h3>
        <p 
          className="text-base"
          style={{ 
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            color: "#C9A064",
            letterSpacing: "0.02em",
          }}
        >
          The Four Pillars of a FUN Human
        </p>
      </motion.div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FOUR_PILLARS.map((pillar, index) => (
          <motion.div
            key={pillar.vi}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative p-5 rounded-xl text-center"
            style={{
              background: "linear-gradient(135deg, #FAF7F2 0%, #F5F0EA 100%)",
              border: "2px solid #E8D4B8",
              boxShadow: "0 4px 16px rgba(139, 90, 155, 0.08)",
            }}
          >
            {/* Icon */}
            <div 
              className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
              }}
            >
              <span className="text-2xl">{pillar.icon}</span>
            </div>

            {/* Vietnamese Title */}
            <h4 
              className="text-xl font-bold mb-2"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                color: "#D63384",
                letterSpacing: "0.02em",
              }}
            >
              {pillar.vi}
            </h4>

            {/* English Title */}
            <p 
              className="text-sm mb-3"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                color: "#D4A84B",
                letterSpacing: "0.01em",
              }}
            >
              {pillar.en}
            </p>

            {/* Description */}
            <p 
              className="text-sm leading-relaxed"
              style={{ 
                color: "#5C4033",
                letterSpacing: "0.01em",
              }}
            >
              {pillar.description}
            </p>

            {/* Bottom accent line */}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full"
              style={{
                background: "linear-gradient(90deg, #D87093, #E8789A)",
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
