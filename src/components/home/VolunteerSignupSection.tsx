import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Heart, 
  Users, 
  MapPin, 
  Calendar, 
  Sparkles, 
  CheckCircle2,
  Loader2,
  HandHeart,
  GraduationCap,
  Stethoscope,
  Utensils,
  Home
} from "lucide-react";

const volunteerAreas = [
  { id: "education", label: "Giáo Dục", icon: GraduationCap, emoji: "📚" },
  { id: "healthcare", label: "Y Tế", icon: Stethoscope, emoji: "🏥" },
  { id: "food", label: "Lương Thực", icon: Utensils, emoji: "🍚" },
  { id: "housing", label: "Nhà Ở", icon: Home, emoji: "🏠" },
  { id: "community", label: "Cộng Đồng", icon: Users, emoji: "🤝" },
];

const benefits = [
  "Kết nối với cộng đồng những trái tim nhân ái",
  "Nhận chứng nhận tình nguyện viên blockchain",
  "Tích lũy điểm danh dự và huy hiệu đặc biệt",
  "Tham gia các hoạt động từ thiện ý nghĩa",
];

export function VolunteerSignupSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    motivation: "",
  });

  const toggleArea = (areaId: string) => {
    setSelectedAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || selectedAreas.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin và chọn ít nhất một lĩnh vực!");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success("🎉 Cảm ơn bạn đã đăng ký! Chúng mình sẽ liên hệ sớm nhé!");
    setFormData({ fullName: "", email: "", phone: "", location: "", motivation: "" });
    setSelectedAreas([]);
    setIsSubmitting(false);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="gold" className="mb-4">
              <HandHeart className="w-3.5 h-3.5 mr-1" />
              Tham Gia Cùng Mình 💛
            </Badge>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trở Thành <span className="gradient-text">Tình Nguyện Viên</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              Bạn có một trái tim nhân ái? Hãy cùng chúng mình lan tỏa yêu thương 
              đến những hoàn cảnh khó khăn. Mỗi hành động nhỏ đều tạo nên điều kỳ diệu! ✨
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-secondary/10 rounded-xl">
                <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-foreground">5,200+</div>
                <div className="text-xs text-muted-foreground">Tình Nguyện Viên</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-xl">
                <MapPin className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-foreground">63</div>
                <div className="text-xs text-muted-foreground">Tỉnh Thành</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-foreground">1,800+</div>
                <div className="text-xs text-muted-foreground">Hoạt Động</div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground mb-2">Khi tham gia, bạn sẽ:</h4>
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form 
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-secondary" />
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Đăng Ký Tình Nguyện Viên
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Họ và tên của bạn 💛"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background"
                  />
                  <Input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-background"
                  />
                </div>

                <Input
                  placeholder="Bạn đang ở đâu? (Tỉnh/Thành phố)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-background"
                />

                {/* Volunteer Areas */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Lĩnh vực bạn muốn tham gia: 🌟
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {volunteerAreas.map((area) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => toggleArea(area.id)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedAreas.includes(area.id)
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {area.emoji} {area.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder="Điều gì thôi thúc bạn muốn làm tình nguyện? (Tùy chọn) 💭"
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  className="bg-background resize-none"
                  rows={3}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Đăng Ký Ngay
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <a href="/terms" className="text-secondary hover:underline">Điều khoản sử dụng</a>
                  {" "}của chúng mình 💛
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
