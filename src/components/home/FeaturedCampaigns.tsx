import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Heart, Users, Clock, MapPin, Verified, TrendingUp, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const campaigns = [
  { 
    id: 1, 
    title: "Nước Sạch Cho Trẻ Em Vùng Cao", 
    organization: "Quỹ Hy Vọng Xanh", 
    image: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&auto=format&fit=crop&q=60", 
    raised: 45000, 
    goal: 60000, 
    donors: 892, 
    daysLeft: 12, 
    location: "Hà Giang, Việt Nam", 
    category: "Nước & Sức Khỏe", 
    verified: true, 
    trending: true, 
    txHash: "0x1a2b...3c4d" 
  },
  { 
    id: 2, 
    title: "Áo Ấm Mùa Đông Cho Em", 
    organization: "Hội Trái Tim Nhân Ái", 
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format&fit=crop&q=60", 
    raised: 28500, 
    goal: 40000, 
    donors: 456, 
    daysLeft: 25, 
    location: "Lào Cai, Việt Nam", 
    category: "Giáo Dục & Trẻ Em", 
    verified: true, 
    trending: false, 
    txHash: "0x5e6f...7g8h" 
  },
  { 
    id: 3, 
    title: "Bữa Cơm Yêu Thương Mỗi Ngày", 
    organization: "Mạng Lưới Thiện Nguyện VN", 
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60", 
    raised: 89000, 
    goal: 100000, 
    donors: 2341, 
    daysLeft: 5, 
    location: "TP.HCM, Việt Nam", 
    category: "Hỗ Trợ Lương Thực", 
    verified: true, 
    trending: true, 
    txHash: "0x9i0j...1k2l" 
  },
];

export function FeaturedCampaigns() {
  return (
    <section className="py-24 relative bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(275_70%_18%_/_0.03),_transparent_70%)]" />
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Badge variant="gold" className="mb-3">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Những Tấm Lòng Đang Chờ Bạn 💛
            </Badge>
            <h2 className="font-display text-4xl font-bold">
              Cùng Nhau <span className="gradient-text">Lan Tỏa Yêu Thương</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Mỗi đóng góp của bạn đều được ghi nhận minh bạch và chạm đến những hoàn cảnh cần giúp đỡ nhất 💞
            </p>
          </div>
          <Link to="/campaigns">
            <Button variant="outline" className="group">
              Khám Phá Thêm Chiến Dịch
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <motion.div 
              key={campaign.id} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/campaigns/${campaign.id}`}>
                <article className="glass-card-hover overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={campaign.image} 
                      alt={campaign.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {campaign.verified && (
                        <Badge variant="verified" className="backdrop-blur-sm">
                          <Verified className="w-3 h-3" />Đã Xác Minh
                        </Badge>
                      )}
                      {campaign.trending && (
                        <Badge variant="trending" className="backdrop-blur-sm">
                          <TrendingUp className="w-3 h-3" />Đang Hot 🔥
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <Badge variant="secondary" className="backdrop-blur-sm">{campaign.category}</Badge>
                      <Badge variant="blockchain" className="backdrop-blur-sm text-xs">
                        <ExternalLink className="w-2.5 h-2.5" />{campaign.txHash}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3.5 h-3.5" />{campaign.location}
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-1 line-clamp-2 group-hover:text-secondary transition-colors">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">bởi {campaign.organization}</p>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-secondary">${campaign.raised.toLocaleString()}</span>
                        <span className="text-muted-foreground">mục tiêu ${campaign.goal.toLocaleString()}</span>
                      </div>
                      <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-secondary" />{campaign.donors} tấm lòng
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />còn {campaign.daysLeft} ngày
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
