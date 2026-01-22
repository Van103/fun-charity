import { motion } from "framer-motion";
import { Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIVINE_MANTRAS } from "@/data/light-constitution";
import { useState } from "react";
import { toast } from "sonner";

export function MantrasGallery() {
  const [readingId, setReadingId] = useState<number | null>(null);

  const handleReadMantra = (mantraId: number) => {
    setReadingId(mantraId);
    
    setTimeout(() => {
      setReadingId(null);
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <span>Bạn đã đọc Thần Chú #{mantraId} và nhận <strong className="text-amber-400">1,000 $FUN</strong>!</span>
        </div>,
        {
          description: "Ánh sáng đang lan tỏa từ trái tim bạn 💜✨",
          duration: 4000,
        }
      );
    }, 2000);
  };

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl">🌈</span>
          {/* Section title - Violet Luxury Gradient */}
          <h2 
            className="text-2xl md:text-3xl font-bold"
            style={{
              background: "linear-gradient(135deg, #c4b5fd 0%, #f5d0fe 25%, #a78bfa 50%, #e9d5ff 75%, #c4b5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 40px rgba(139, 92, 246, 0.4)",
            }}
          >
            8 THẦN CHÚ ÁNH SÁNG
          </h2>
          <span className="text-4xl">🌈</span>
        </div>
        <p className="text-violet-200/70 italic">
          Divine Mantras – Chuẩn Toàn Hệ FUN Ecosystem
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DIVINE_MANTRAS.map((mantra, index) => (
          <motion.div
            key={mantra.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group relative"
          >
            <div 
              className="relative overflow-hidden rounded-xl backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, rgba(26, 10, 46, 0.6), rgba(22, 8, 42, 0.4), rgba(13, 5, 26, 0.6))",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              {/* Mantra number - Deep Amethyst */}
              <div 
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6b21a8)",
                  border: "1px solid rgba(196, 181, 253, 0.4)",
                }}
              >
                <span className="text-white font-bold text-sm">{mantra.id}</span>
              </div>
              
              {/* Icon */}
              <div className="text-3xl mb-3">{mantra.icon}</div>
              
              {/* Vietnamese - Rose Gold Gradient */}
              <p 
                className="text-lg font-semibold mb-2"
                style={{
                  background: "linear-gradient(135deg, #fda4af 0%, #fecdd3 50%, #fb7185 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {mantra.vi}
              </p>
              
              {/* English */}
              <p className="text-sm text-violet-200/60 italic mb-4">
                {mantra.en}
              </p>
              
              {/* Read button - Violet themed */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleReadMantra(mantra.id)}
                disabled={readingId === mantra.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity gap-2 text-violet-300 hover:text-violet-200 hover:bg-violet-500/10"
              >
                {readingId === mantra.id ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Đang đọc...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    Đọc thần chú (+1,000 $FUN)
                  </>
                )}
              </Button>
              
              {/* Glow on hover - Violet + Rose mix */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent, rgba(251, 113, 133, 0.05))",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
