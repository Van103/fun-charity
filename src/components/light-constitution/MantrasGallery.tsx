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
          <Sparkles className="w-5 h-5 text-secondary" />
          <span>Bạn đã đọc Thần Chú #{mantraId} và nhận <strong className="text-secondary">1,000 $FUN</strong>!</span>
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
          <h2 className="text-2xl md:text-3xl font-bold text-secondary">
            8 THẦN CHÚ ÁNH SÁNG
          </h2>
          <span className="text-4xl">🌈</span>
        </div>
        <p className="text-primary-foreground/70 italic">
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
            <div className="relative overflow-hidden rounded-xl border border-secondary/20 bg-gradient-to-br from-primary/50 via-primary/30 to-primary/10 backdrop-blur-sm p-5 transition-all duration-300 hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/10">
              {/* Mantra number */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-secondary font-bold text-sm">{mantra.id}</span>
              </div>
              
              {/* Icon */}
              <div className="text-3xl mb-3">{mantra.icon}</div>
              
              {/* Vietnamese */}
              <p className="text-lg font-semibold text-secondary mb-2">
                {mantra.vi}
              </p>
              
              {/* English */}
              <p className="text-sm text-primary-foreground/60 italic mb-4">
                {mantra.en}
              </p>
              
              {/* Read button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleReadMantra(mantra.id)}
                disabled={readingId === mantra.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity gap-2 text-secondary hover:text-secondary hover:bg-secondary/10"
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
              
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 via-secondary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
