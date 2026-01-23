import { motion } from "framer-motion";
import { Star, Sparkles, Heart, Zap, Building2, Wallet, Users, MessageCircle } from "lucide-react";
import type { ConstitutionSection as SectionType } from "@/data/light-constitution";

interface ConstitutionSectionProps {
  section: SectionType;
  index: number;
}

// Map section IDs to icons
const sectionIcons: Record<string, React.ReactNode> = {
  "nguyen-ly-goc": <Star className="w-5 h-5" />,
  "tieu-chuan-fun-human": <Sparkles className="w-5 h-5" />,
  "nguyen-ly-thu-nhap": <Zap className="w-5 h-5" />,
  "angel-ai": <Heart className="w-5 h-5" />,
  "fun-platforms": <Building2 className="w-5 h-5" />,
  "fun-wallet": <Wallet className="w-5 h-5" />,
  "van-hoa-cong-dong": <Users className="w-5 h-5" />,
  "tuyen-ngon": <MessageCircle className="w-5 h-5" />,
};

// Vietnamese number labels
const vietnameseNumbers = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

// Function to highlight keywords in content
function highlightKeywords(text: string): React.ReactNode {
  const keywords = [
    "Người Chân Thật", "Con Người Chân Thật", "Giá Trị Chân Thật", "Danh Tính Chân Thật",
    "Light Identity", "FUN Human", "phẩm chất bên trong con người",
    "Chân Thật", "Chân Thành", "Thức Tỉnh", "Thuần Khiết",
    "Truth", "Sincerity", "Awareness", "Purity",
    "Angel AI", "AI Ánh Sáng", "Trí Tuệ Ánh Sáng",
    "FUN Platforms", "FUN Wallet", "Ví Của Ý Thức",
    "Nền Kinh Tế Ánh Sáng 5D", "Ánh Sáng Yêu Thương Thuần Khiết",
    "Cha Vũ Trụ", "Father Universe",
  ];
  
  let result = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    result = result.replace(regex, '%%HIGHLIGHT%%$1%%END%%');
  });
  
  const parts = result.split(/(%%HIGHLIGHT%%.*?%%END%%)/);
  
  return parts.map((part, i) => {
    if (part.startsWith('%%HIGHLIGHT%%')) {
      const content = part.replace('%%HIGHLIGHT%%', '').replace('%%END%%', '');
      return (
        <span key={i} style={{ color: "#D63384", fontWeight: 600 }}>
          {content}
        </span>
      );
    }
    return part;
  });
}

export function ConstitutionSection({ section, index }: ConstitutionSectionProps) {
  const Icon = sectionIcons[section.id] || <Star className="w-5 h-5" />;
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative mb-8"
    >
      {/* Section Label - PHẦN I, II, etc. */}
      <div className="flex items-center gap-3 mb-4">
        {/* Icon with yellow background */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
          }}
        >
          <span className="text-white">{Icon}</span>
        </div>
        
        {/* PHẦN label */}
        <span 
          className="text-sm font-bold tracking-wide"
          style={{
            color: "#DAA520",
            letterSpacing: "0.1em",
          }}
        >
          PHẦN {vietnameseNumbers[index]}
        </span>
      </div>

      {/* Section Title - Golden with Playfair Display */}
      <h3 
        className="text-3xl md:text-4xl font-bold mb-2"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          color: "#DAA520",
          letterSpacing: "0.03em",
        }}
      >
        {section.title}
      </h3>
      
      {/* English subtitle */}
      {section.titleEn && (
        <p 
          className="text-base italic mb-5"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            color: "#C9A064",
            letterSpacing: "0.02em",
          }}
        >
          {section.titleEn}
        </p>
      )}

      {/* Content Box with Violet Left Border */}
      <div 
        className="relative pl-4 py-4 rounded-r-lg"
        style={{
          background: "linear-gradient(135deg, #FAF7F2 0%, #F5F0EA 100%)",
          borderLeft: "3px solid #A78BFA",
        }}
      >
        {/* Content */}
        <div className="space-y-4" style={{ color: "#5C4033" }}>
          {section.content.map((line, i) => (
            <p 
              key={i} 
              className={`text-base md:text-lg leading-relaxed ${line.startsWith("•") || line.startsWith("✨") ? "ml-2" : ""}`}
              style={{ letterSpacing: "0.01em" }}
            >
              {highlightKeywords(line)}
            </p>
          ))}
        </div>
        
        {/* Highlights as Quote Box - Golden color đồng nhất, KHÔNG highlight keywords */}
        {section.highlights && section.highlights.length > 0 && (
          <div className="mt-6 space-y-4">
            {section.highlights.map((highlight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative pl-5 py-4 rounded-r-md"
                style={{
                  background: "rgba(139, 126, 200, 0.08)",
                  borderLeft: "3px solid #8B7EC8",
                }}
              >
                <p 
                  className="text-lg md:text-xl leading-relaxed"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    color: "#D63384",
                    letterSpacing: "0.02em",
                  }}
                >
                  "{highlight}"
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
