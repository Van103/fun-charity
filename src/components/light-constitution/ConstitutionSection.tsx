import { motion } from "framer-motion";
import type { ConstitutionSection as SectionType } from "@/data/light-constitution";

interface ConstitutionSectionProps {
  section: SectionType;
  index: number;
}

export function ConstitutionSection({ section, index }: ConstitutionSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent backdrop-blur-sm p-6 md:p-8">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 pointer-events-none" />
        
        {/* Section number badge */}
        <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-amber-500 flex items-center justify-center shadow-lg shadow-secondary/30">
          <span className="text-primary-foreground font-bold text-lg">{section.number}</span>
        </div>
        
        {/* Header */}
        <div className="ml-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{section.icon}</span>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-secondary">
                {section.title}
              </h3>
              {section.titleEn && (
                <p className="text-sm text-primary-foreground/60 italic">
                  {section.titleEn}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3 text-primary-foreground/80">
          {section.content.map((line, i) => (
            <p key={i} className={line.startsWith("•") ? "ml-4" : ""}>
              {line}
            </p>
          ))}
        </div>
        
        {/* Highlights */}
        {section.highlights && section.highlights.length > 0 && (
          <div className="mt-6 space-y-3">
            {section.highlights.map((highlight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative pl-4 border-l-2 border-secondary/50"
              >
                <p className="text-primary-foreground/90 font-medium italic">
                  {highlight}
                </p>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-20 h-20 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-tl from-secondary via-secondary/50 to-transparent rounded-tl-full" />
        </div>
      </div>
    </motion.section>
  );
}
