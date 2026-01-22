import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Heart, ArrowLeft } from "lucide-react";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { LIGHT_CONSTITUTION, CONSTITUTION_SECTIONS } from "@/data/light-constitution";
import {
  ConstitutionHeader,
  ConstitutionSection,
  FourPillars,
  MantrasGallery,
  ClosingMessage,
} from "@/components/light-constitution";

const LawOfLight = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enterGuestMode } = useGuestMode();
  const [checklist, setChecklist] = useState({
    truth: false,
    sincerity: false,
    awareness: false,
    purity: false,
    lightIncome: false,
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const handleAgree = () => {
    localStorage.setItem("law_of_light_agreed", "true");
    localStorage.setItem("law_of_light_agreed_at", new Date().toISOString());
    
    const nextUrl = searchParams.get("next");
    if (nextUrl && nextUrl.startsWith("/")) {
      navigate(nextUrl);
    } else {
      navigate("/auth");
    }
  };

  const handleGuest = () => {
    enterGuestMode();
    navigate("/social");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 relative overflow-hidden">
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-secondary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        
        {/* Golden light rays */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20"
          style={{
            background: "radial-gradient(ellipse at center top, hsl(var(--secondary)) 0%, transparent 70%)",
          }}
        />
      </div>

      <ScrollArea className="h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8 pb-40">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-primary-foreground/70 hover:text-secondary gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          </motion.div>

          {/* Header */}
          <ConstitutionHeader />

          {/* Four Pillars */}
          <FourPillars />

          {/* Constitution Sections */}
          <div className="space-y-6 mt-12">
            {CONSTITUTION_SECTIONS.map((section, index) => (
              <ConstitutionSection key={section.id} section={section} index={index} />
            ))}
          </div>

          {/* Divine Mantras Gallery */}
          <MantrasGallery />

          {/* Closing Message */}
          <ClosingMessage />

          {/* Agreement Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/50 via-primary/30 to-transparent backdrop-blur-sm border border-secondary/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-secondary" />
              <h2 className="text-xl md:text-2xl font-bold text-secondary">
                Cam Kết Với Ánh Sáng
              </h2>
            </div>

            <p className="text-primary-foreground/80 mb-6">
              Để gia nhập FUN Ecosystem, con xin xác nhận:
            </p>

            <div className="space-y-4 mb-8">
              {[
                { key: "truth", label: "Con sống Chân Thật với chính mình và cộng đồng", icon: "🌱" },
                { key: "sincerity", label: "Con tham gia với trái tim Chân Thành hướng về Ánh Sáng", icon: "💚" },
                { key: "awareness", label: "Con ý thức rằng tiền là dòng chảy năng lượng của tạo hóa (Thức Tỉnh)", icon: "👁️" },
                { key: "purity", label: "Con hành xử bằng tình yêu, tôn trọng và từ bi (Thuần Khiết)", icon: "🤍" },
                { key: "lightIncome", label: "Con hiểu thu nhập đến từ tần số sống và chất lượng ý thức", icon: "✨" },
              ].map((item) => (
                <motion.div
                  key={item.key}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setChecklist((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                >
                  <Checkbox
                    id={item.key}
                    checked={checklist[item.key as keyof typeof checklist]}
                    onCheckedChange={(checked) =>
                      setChecklist((prev) => ({ ...prev, [item.key]: !!checked }))
                    }
                    className="mt-0.5 border-secondary data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                  />
                  <label htmlFor={item.key} className="flex items-center gap-2 text-primary-foreground cursor-pointer">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </label>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleAgree}
                disabled={!allChecked}
                className="bg-gradient-to-r from-secondary to-amber-500 text-primary hover:opacity-90 gap-2 px-8 py-6 text-lg shadow-lg shadow-secondary/30 disabled:opacity-50"
              >
                <Heart className="w-5 h-5" />
                Đồng Ý & Gia Nhập Ánh Sáng
              </Button>
              
              <Button
                variant="outline"
                onClick={handleGuest}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-white/10 px-8 py-6"
              >
                Tham Quan Với Tư Cách Khách
              </Button>
            </div>

            <p className="text-center text-primary-foreground/50 text-sm mt-6 italic">
              "Ánh sáng là thước đo tự nhiên của mọi giá trị"
            </p>
          </motion.section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default LawOfLight;
