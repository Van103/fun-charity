import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Heart, ArrowLeft, Check } from "lucide-react";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { CONSTITUTION_SECTIONS } from "@/data/light-constitution";
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
    read: false,
    understand: false,
    agree: false,
    commit: false,
    share: false,
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
      className="min-h-screen relative"
      style={{
        background: "linear-gradient(180deg, #FBF8F4 0%, #FDF9F3 50%, #FAF7F2 100%)",
      }}
    >
      {/* Subtle decorative elements */}
      <div 
        className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139, 126, 200, 0.3) 0%, transparent 70%)",
        }}
      />
      <div 
        className="fixed bottom-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212, 168, 75, 0.3) 0%, transparent 70%)",
        }}
      />

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 left-4 z-50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid #E8D4B8",
            color: "#6B3D7B",
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </motion.div>

      <ScrollArea className="h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <ConstitutionHeader />

          {/* Constitution Sections */}
          <div className="space-y-8 mb-12">
            {CONSTITUTION_SECTIONS.slice(0, 5).map((section, index) => (
              <ConstitutionSection key={section.id} section={section} index={index} />
            ))}
          </div>

          {/* Four Pillars */}
          <FourPillars />

          {/* Remaining Sections with Angel Decoration */}
          <div className="space-y-8 mb-12">
            {CONSTITUTION_SECTIONS.slice(5, 7).map((section, index) => (
              <ConstitutionSection key={section.id} section={section} index={index + 5} />
            ))}


            {CONSTITUTION_SECTIONS.slice(7).map((section, index) => (
              <ConstitutionSection key={section.id} section={section} index={index + 7} />
            ))}
          </div>

          {/* Mantras Gallery */}
          <MantrasGallery />

          {/* Closing Message */}
          <ClosingMessage />

          {/* Agreement Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-6 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #FAF7F2 0%, #F5F0EA 100%)",
              border: "2px solid #E8D4B8",
              boxShadow: "0 8px 32px rgba(139, 90, 155, 0.1)",
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Sparkles className="w-7 h-7" style={{ color: "#D63384" }} />
              <h3 
                className="text-2xl md:text-3xl font-bold"
                style={{ 
                  fontFamily: "'Francois One', sans-serif",
                  color: "#D63384",
                  letterSpacing: "0.03em",
                }}
              >
                Cam Kết Ánh Sáng
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              {[
                { key: "read", label: "Tôi đã đọc toàn bộ Hiến Pháp Ánh Sáng", icon: "📖" },
                { key: "understand", label: "Tôi hiểu rõ các nguyên lý và giá trị cốt lõi", icon: "💡" },
                { key: "agree", label: "Tôi đồng ý tuân theo Hiến Pháp Ánh Sáng", icon: "✅" },
                { key: "commit", label: "Tôi cam kết sống chân thật và phụng sự Ánh Sáng", icon: "🌟" },
                { key: "share", label: "Tôi sẵn sàng lan tỏa yêu thương trong cộng đồng", icon: "💜" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all hover:bg-white/50"
                >
                  <Checkbox
                    checked={checklist[item.key as keyof typeof checklist]}
                    onCheckedChange={(checked) =>
                      setChecklist((prev) => ({ ...prev, [item.key]: checked === true }))
                    }
                    className="border-2 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                    style={{
                      borderColor: "#8B7EC8",
                    }}
                  />
                  <span className="text-xl">{item.icon}</span>
                  <span 
                    className="text-base md:text-lg"
                    style={{ 
                      fontFamily: "'Francois One', sans-serif",
                      color: "#D63384",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAgree}
                disabled={!allChecked}
                className="flex-1 py-6 text-lg font-bold rounded-xl transition-all duration-300"
                style={{
                  background: allChecked 
                    ? "linear-gradient(135deg, #8B5A9B 0%, #6B3D7B 100%)"
                    : "#E5E5E5",
                  color: allChecked ? "#fff" : "#999",
                  boxShadow: allChecked 
                    ? "0 4px 16px rgba(107, 61, 123, 0.3)"
                    : "none",
                }}
              >
                <Heart className="w-5 h-5 mr-2" />
                Đồng Ý & Gia Nhập Ánh Sáng
              </Button>

              <Button
                variant="outline"
                onClick={handleGuest}
                className="flex-1 py-6 text-lg font-medium rounded-xl"
                style={{
                  border: "2px solid #D4A84B",
                  color: "#D4A84B",
                  background: "transparent",
                }}
              >
                Tham Quan Với Tư Cách Khách
              </Button>
            </div>

            {/* Quote */}
            <p 
              className="text-center text-sm mt-6 italic"
              style={{ color: "#C9A064" }}
            >
              "Ánh sáng là thước đo tự nhiên của mọi giá trị"
            </p>
          </motion.div>

          {/* Bottom Spacing */}
          <div className="h-16" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default LawOfLight;
