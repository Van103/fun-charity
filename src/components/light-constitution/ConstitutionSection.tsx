import { motion } from "framer-motion";
import type { ConstitutionSection as SectionType } from "@/data/light-constitution";

interface ConstitutionSectionProps {
  section: SectionType;
  index: number;
}

export function ConstitutionSection({ section, index }: ConstitutionSectionProps) {
  const isAngelAI = section.id === "angel-ai";
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative"
    >
      <div 
        className={`relative overflow-hidden rounded-2xl backdrop-blur-sm p-6 md:p-8 ${
          isAngelAI 
            ? "border-2 border-violet-400/40 shadow-xl shadow-violet-500/20" 
            : "border border-violet-500/30"
        }`}
        style={{
          background: isAngelAI 
            ? "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.25))"
            : "linear-gradient(135deg, rgba(26, 10, 46, 0.6), rgba(22, 8, 42, 0.4), rgba(13, 5, 26, 0.6))",
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isAngelAI
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15), transparent, rgba(99, 102, 241, 0.1))"
              : "linear-gradient(135deg, rgba(139, 92, 246, 0.08), transparent, rgba(251, 113, 133, 0.05))"
          }}
        />
        
        {/* Section number badge - Deep Amethyst */}
        <div 
          className="absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6b21a8)",
            border: "2px solid rgba(196, 181, 253, 0.5)",
            boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
          }}
        >
          <span className="text-white font-bold text-lg">{section.number}</span>
        </div>
        
        {/* Header */}
        <div className="ml-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{section.icon}</span>
            <div>
              {/* Section title - Warm Gold Gradient */}
              <h3 
                className="text-xl md:text-2xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #fcd34d 0%, #fef08a 50%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 30px rgba(251, 191, 36, 0.3)",
                }}
              >
                {section.title}
              </h3>
              {section.titleEn && (
                <p className="text-sm text-violet-200/60 italic">
                  {section.titleEn}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3 text-violet-100/80">
          {section.content.map((line, i) => (
            <p key={i} className={line.startsWith("•") ? "ml-4" : ""}>
              {line}
            </p>
          ))}
        </div>
        
        {/* Highlights - Rose Gold */}
        {section.highlights && section.highlights.length > 0 && (
          <div className="mt-6 space-y-3">
            {section.highlights.map((highlight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative pl-4"
                style={{
                  borderLeft: "2px solid rgba(251, 113, 133, 0.6)",
                }}
              >
                <p 
                  className="font-medium italic"
                  style={{
                    background: "linear-gradient(135deg, #fda4af, #fecdd3, #fb7185)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {highlight}
                </p>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Decorative corner - Violet gradient */}
        <div className="absolute bottom-0 right-0 w-20 h-20 opacity-30">
          <div 
            className="absolute inset-0 rounded-tl-full"
            style={{
              background: "linear-gradient(to top left, rgba(139, 92, 246, 0.5), rgba(139, 92, 246, 0.2), transparent)"
            }}
          />
        </div>

        {/* Angel AI special glow effect */}
        {isAngelAI && (
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              boxShadow: "inset 0 0 60px rgba(139, 92, 246, 0.2)",
            }}
          />
        )}
      </div>
    </motion.section>
  );
}
