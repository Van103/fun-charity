import { motion } from "framer-motion";
import { LIGHT_CONSTITUTION } from "@/data/light-constitution";

export function ConstitutionHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-12 md:mb-16"
    >
      {/* Light Constitution Label */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-6"
      >
        <span 
          className="inline-block px-6 py-2 text-sm md:text-base font-medium tracking-widest"
          style={{
            color: "#DAA520",
            letterSpacing: "0.2em",
          }}
        >
          ✨ LIGHT CONSTITUTION ✨
        </span>
      </motion.div>

      {/* Main Title - Purple Script with Playfair Display */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          color: "#9B59B6",
        }}
      >
        Hiến Pháp Ánh Sáng
      </motion.h1>

      {/* FUN Ecosystem - Golden */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-3xl md:text-4xl mb-4"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          color: "#DAA520",
        }}
      >
        FUN Ecosystem
      </motion.p>

      {/* Subtitle - Violet */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-base md:text-lg font-medium mb-8"
        style={{
          color: "#DAA520",
        }}
      >
        {LIGHT_CONSTITUTION.subtitle}
      </motion.p>

      {/* Core Principle Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="inline-block"
      >
        <div 
          className="relative px-6 py-4 rounded-xl"
          style={{
            background: "linear-gradient(135deg, #FAF7F2 0%, #F5F0EA 100%)",
            border: "2px solid #E8D4B8",
            boxShadow: "0 4px 20px rgba(139, 90, 155, 0.1)",
          }}
        >
          {/* Vietnamese */}
          <p 
            className="text-lg md:text-xl font-bold mb-3"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              color: "#6B3D7B",
              letterSpacing: "0.04em",
            }}
          >
            {LIGHT_CONSTITUTION.corePrinciple.vi}
          </p>
          
          {/* English */}
          <p 
            className="text-base md:text-lg font-medium"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              color: "#D4A84B",
              letterSpacing: "0.02em",
            }}
          >
            {LIGHT_CONSTITUTION.corePrinciple.en}
          </p>
        </div>
      </motion.div>
    </motion.header>
  );
}
