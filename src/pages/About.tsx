import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Heart,
  Users,
  Globe,
  Shield,
  Sparkles,
  Target,
  Eye,
  Zap,
  Award,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Quote,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Yêu Thương Từ Trái Tim",
    description: "Mỗi hành động của chúng mình đều xuất phát từ tình yêu thương chân thành, không tính toán, không điều kiện.",
    emoji: "💛",
  },
  {
    icon: Shield,
    title: "Minh Bạch Tuyệt Đối",
    description: "Công nghệ blockchain giúp mọi đóng góp được ghi nhận rõ ràng. Bạn biết chính xác tiền của mình đi đâu.",
    emoji: "🔒",
  },
  {
    icon: Users,
    title: "Cộng Đồng Là Sức Mạnh",
    description: "Chúng mình tin rằng khi mọi người cùng chung tay, không có khó khăn nào không thể vượt qua.",
    emoji: "🤝",
  },
  {
    icon: Zap,
    title: "Hành Động Nhanh Chóng",
    description: "Kết nối trực tiếp người cho và người nhận, không qua trung gian, giúp sự hỗ trợ đến nhanh nhất có thể.",
    emoji: "⚡",
  },
];

const milestones = [
  { year: "2022", title: "Khởi Đầu Ước Mơ", description: "FUN Charity ra đời từ một nhóm bạn trẻ yêu thương và muốn thay đổi" },
  { year: "2023", title: "Kết Nối Blockchain", description: "Tích hợp công nghệ blockchain để đảm bảo minh bạch 100%" },
  { year: "2024", title: "Cộng Đồng Lớn Mạnh", description: "45,000+ nhà hảo tâm và 5,000+ tình nguyện viên khắp Việt Nam" },
  { year: "2025", title: "Lan Tỏa Khắp Nơi", description: "Mở rộng đến 80+ quốc gia, tiếp tục sứ mệnh yêu thương" },
];

const teamValues = [
  "Không ai bị bỏ lại phía sau",
  "Mỗi đồng tiền đều có giá trị",
  "Công nghệ phục vụ con người",
  "Tình yêu thương không biên giới",
];

export default function About() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(43_55%_52%_/_0.1),_transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="gold" className="mb-4">
              <Heart className="w-3.5 h-3.5 mr-1" />
              Về Chúng Mình 💛
            </Badge>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Câu Chuyện Của <span className="gradient-text">FUN Charity</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Chúng mình không chỉ là một nền tảng từ thiện – mà là một gia đình của những 
              trái tim nhân ái, cùng nhau lan tỏa yêu thương đến mọi ngóc ngách cuộc sống.
            </p>

            <div className="flex items-center justify-center gap-2 text-secondary">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium italic">Cho đi là hạnh phúc. Minh bạch là niềm tin.</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                Khởi Nguồn Từ Một Câu Hỏi 💭
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <em>"Làm sao để mỗi đồng tiền quyên góp đều thật sự chạm đến người cần?"</em>
                </p>
                <p>
                  Câu hỏi ấy đã thôi thúc một nhóm bạn trẻ Việt Nam tạo nên FUN Charity vào năm 2022. 
                  Chúng mình nhận ra rằng nhiều người muốn giúp đỡ, nhưng lại lo lắng về sự minh bạch 
                  và không biết tiền của mình đi đến đâu.
                </p>
                <p>
                  Với công nghệ blockchain, chúng mình đã tạo ra một nền tảng nơi mọi giao dịch 
                  đều được ghi nhận công khai, không thể thay đổi. Bạn không chỉ quyên góp – 
                  bạn còn có thể theo dõi hành trình của sự giúp đỡ từ trái tim mình.
                </p>
                <p className="font-medium text-foreground">
                  ✨ FUN không chỉ là viết tắt – mà còn là tinh thần: Làm từ thiện một cách 
                  vui vẻ, nhẹ nhàng và tràn đầy yêu thương!
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-secondary/20 to-primary/10 rounded-3xl p-8 border border-secondary/20">
                <Quote className="w-10 h-10 text-secondary mb-4" />
                <blockquote className="text-lg text-foreground italic mb-4">
                  "Chúng mình tin rằng mỗi người đều có khả năng thay đổi thế giới – 
                  bắt đầu từ một hành động nhỏ, một đóng góp nhỏ, một sự quan tâm nhỏ. 
                  Nhưng khi hàng nghìn trái tim cùng đập chung một nhịp, 
                  điều kỳ diệu sẽ xảy ra."
                </blockquote>
                <p className="text-secondary font-semibold">— Đội Ngũ FUN Charity</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Tầm Nhìn Của Chúng Mình 👁️
              </h3>
              <p className="text-muted-foreground">
                Một thế giới nơi không ai bị bỏ lại phía sau, nơi sự giúp đỡ đến với người cần 
                một cách nhanh chóng, minh bạch và đầy yêu thương. Chúng mình mơ về một Việt Nam 
                và một thế giới nơi lòng tốt được ghi nhận, và mỗi hành động thiện nguyện 
                đều tạo nên làn sóng tích cực.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Sứ Mệnh Của Chúng Mình 🎯
              </h3>
              <p className="text-muted-foreground">
                Kết nối những trái tim nhân ái với những hoàn cảnh cần giúp đỡ thông qua 
                công nghệ hiện đại. Chúng mình cam kết minh bạch 100% trong mọi hoạt động, 
                đảm bảo mỗi đồng tiền quyên góp đều đến đúng nơi cần đến, 
                và xây dựng một cộng đồng từ thiện đáng tin cậy nhất.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Giá Trị Cốt Lõi 💎
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những điều chúng mình luôn giữ trong trái tim và thực hiện mỗi ngày
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 text-center hover:border-secondary/50 transition-colors"
                >
                  <div className="text-3xl mb-3">{value.emoji}</div>
                  <Icon className="w-8 h-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Hành Trình Của Chúng Mình 🚀
            </h2>
            <p className="text-muted-foreground">
              Từ một ý tưởng nhỏ đến cộng đồng từ thiện lớn mạnh
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="font-display text-2xl font-bold text-secondary">
                    {milestone.year}
                  </span>
                </div>
                <div className="flex-shrink-0 relative">
                  <div className="w-4 h-4 bg-secondary rounded-full" />
                  {index < milestones.length - 1 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-secondary/30" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h4 className="font-display font-semibold text-foreground mb-1">
                    {milestone.title}
                  </h4>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold mb-8">
              Chúng Mình Tin Rằng 💫
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              {teamValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">{value}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/campaigns">
              <Button variant="secondary" size="lg" className="group">
                <Heart className="w-5 h-5" />
                Cùng Lan Tỏa Yêu Thương
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, value: "$2.4M+", label: "Yêu Thương Lan Tỏa" },
              { icon: Heart, value: "1,200+", label: "Chiến Dịch Thành Công" },
              { icon: Users, value: "45K+", label: "Tấm Lòng Vàng" },
              { icon: Globe, value: "80+", label: "Quốc Gia Kết Nối" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-card border border-border rounded-2xl"
                >
                  <Icon className="w-8 h-8 text-secondary mx-auto mb-3" />
                  <div className="font-display text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
