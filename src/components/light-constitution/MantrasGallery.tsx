import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { DIVINE_MANTRAS } from "@/data/light-constitution";
import { toast } from "sonner";

export function MantrasGallery() {
  const [readingId, setReadingId] = useState<number | null>(null);

  const handleReadMantra = (mantraId: number) => {
    setReadingId(mantraId);
    
    setTimeout(() => {
      setReadingId(null);
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <span>Bạn đã đọc Thần Chú #{mantraId} và nhận <strong className="text-amber-600">+5 $FUN</strong>!</span>
        </div>,
        {
          description: "Ánh sáng đang lan tỏa từ trái tim bạn 💜✨",
          duration: 4000,
        }
      );
    }, 2000);
  };

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
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            letterSpacing: "0.03em",
            background: "linear-gradient(135deg, #8B5A9B 0%, #6B3D7B 50%, #9B6AAB 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          8 Thần Chú Ánh Sáng
        </h3>
        <p 
          className="text-base italic"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            color: "#C9A064",
            letterSpacing: "0.02em",
          }}
        >
          The Eight Divine Mantras
        </p>
        <p 
          className="text-sm mt-2 max-w-md mx-auto"
          style={{ color: "#6B6B6B" }}
        >
          Đọc thần chú mỗi ngày để nhận phước lành và $FUN tokens
        </p>
      </motion.div>

      {/* Mantras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DIVINE_MANTRAS.map((mantra, index) => (
          <motion.div
            key={mantra.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className="relative p-5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #FAF7F2 0%, #F5F0EA 100%)",
              border: "2px solid #E8D4B8",
              boxShadow: "0 4px 16px rgba(139, 90, 155, 0.08)",
            }}
          >
            <div className="flex items-start gap-4">
              {/* Number Badge */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #8B5A9B 0%, #6B3D7B 100%)",
                  boxShadow: "0 2px 8px rgba(107, 61, 123, 0.3)",
                }}
              >
                <span className="text-white font-bold">{mantra.id}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Icon */}
                <span className="text-2xl mb-2 block">{mantra.icon}</span>
                
                {/* Vietnamese Text */}
                <p 
                  className="text-lg font-semibold mb-2 leading-relaxed"
                  style={{ 
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    color: "#D63384",
                    letterSpacing: "0.02em",
                  }}
                >
                  {mantra.vi}
                </p>

                {/* English Text */}
                <p 
                  className="text-sm italic"
                  style={{ 
                    fontFamily: "'Playfair Display', serif",
                    color: "#C9A064",
                    letterSpacing: "0.01em",
                  }}
                >
                  {mantra.en}
                </p>

                {/* Read Button */}
                <button
                  onClick={() => handleReadMantra(mantra.id)}
                  disabled={readingId === mantra.id}
                  className="mt-3 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2"
                  style={{
                    background: readingId === mantra.id 
                      ? "linear-gradient(135deg, #D4A84B 0%, #E8C066 100%)"
                      : "linear-gradient(135deg, #FAF7F2 0%, #F5F0EA 100%)",
                    border: "2px solid #D4A84B",
                    color: readingId === mantra.id ? "#fff" : "#D4A84B",
                  }}
                >
                  {readingId === mantra.id ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Đang đọc...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Đọc thần chú
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
