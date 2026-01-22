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
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a0a2e 0%, #16082a 50%, #0d051a 100%)",
      }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 right-1/4 w-72 h-72 bg-rose-400/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => {
          const colors = ["#c4b5fd", "#fda4af", "#fcd34d", "#a78bfa"];
          const color = colors[i % colors.length];
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: color,
                opacity: 0.4,
              }}
              animate={{
                y: [-30, 30, -30],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          );
        })}
        
        {/* Violet light rays */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-15"
          style={{
            background: "radial-gradient(ellipse at center top, #c4b5fd 0%, transparent 70%)",
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
              className="text-violet-200/70 hover:text-violet-300 gap-2"
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

          {/* Agreement Section - Luxury styling */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-6 md:p-8 rounded-2xl backdrop-blur-sm"
            style={{
              background: "linear-gradient(135deg, rgba(26, 10, 46, 0.7), rgba(22, 8, 42, 0.5), rgba(13, 5, 26, 0.7))",
              border: "1px solid rgba(251, 113, 133, 0.3)",
              boxShadow: "0 0 60px rgba(139, 92, 246, 0.1)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-violet-400" />
              {/* Section title - Warm Gold */}
              <h2 
                className="text-xl md:text-2xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #fcd34d 0%, #fef08a 50%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Cam Kết Với Ánh Sáng
              </h2>
            </div>

            <p className="text-violet-100/80 mb-6">
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
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-violet-500/5 transition-colors cursor-pointer"
                  onClick={() => setChecklist((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                >
                  <Checkbox
                    id={item.key}
                    checked={checklist[item.key as keyof typeof checklist]}
                    onCheckedChange={(checked) =>
                      setChecklist((prev) => ({ ...prev, [item.key]: !!checked }))
                    }
                    className="mt-0.5 border-violet-400 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                  />
                  <label htmlFor={item.key} className="flex items-center gap-2 text-violet-100 cursor-pointer">
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
                className="text-white hover:opacity-90 gap-2 px-8 py-6 text-lg shadow-lg disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)",
                  boxShadow: "0 4px 30px rgba(139, 92, 246, 0.4)",
                }}
              >
                <Heart className="w-5 h-5" />
                Đồng Ý & Gia Nhập Ánh Sáng
              </Button>
              
              <Button
                variant="outline"
                onClick={handleGuest}
                className="border-violet-400/30 text-violet-200 hover:bg-violet-500/10 px-8 py-6"
              >
                Tham Quan Với Tư Cách Khách
              </Button>
            </div>

            {/* Quote - Rose Gold */}
            <p 
              className="text-center text-sm mt-6 italic"
              style={{
                background: "linear-gradient(135deg, #fda4af, #fecdd3, #fb7185)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              "Ánh sáng là thước đo tự nhiên của mọi giá trị"
            </p>
          </motion.section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default LawOfLight;
