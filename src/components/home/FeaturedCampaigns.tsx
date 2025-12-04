import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Heart,
  Users,
  Clock,
  MapPin,
  Verified,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const campaigns = [
  {
    id: 1,
    title: "Clean Water for Rural Vietnam",
    organization: "WaterAid Vietnam",
    image: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&auto=format&fit=crop&q=60",
    raised: 45000,
    goal: 60000,
    donors: 892,
    daysLeft: 12,
    location: "Vietnam",
    category: "Water & Sanitation",
    verified: true,
    trending: true,
  },
  {
    id: 2,
    title: "Education for Underprivileged Children",
    organization: "EduHope Foundation",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format&fit=crop&q=60",
    raised: 28500,
    goal: 40000,
    donors: 456,
    daysLeft: 25,
    location: "India",
    category: "Education",
    verified: true,
    trending: false,
  },
  {
    id: 3,
    title: "Emergency Food Relief - East Africa",
    organization: "Global Food Network",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60",
    raised: 89000,
    goal: 100000,
    donors: 2341,
    daysLeft: 5,
    location: "Kenya",
    category: "Hunger Relief",
    verified: true,
    trending: true,
  },
];

export function FeaturedCampaigns() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.05),_transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Badge variant="accent" className="mb-3">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Featured Campaigns
            </Badge>
            <h2 className="font-display text-4xl font-bold">
              Make an Impact <span className="gradient-text">Today</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Support verified campaigns and track your impact in real-time
            </p>
          </div>
          <Link to="/campaigns">
            <Button variant="outline" className="group">
              View All Campaigns
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Campaign Grid */}
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
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {campaign.verified && (
                        <Badge variant="verified" className="backdrop-blur-sm">
                          <Verified className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                      {campaign.trending && (
                        <Badge variant="trending" className="backdrop-blur-sm">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </Badge>
                      )}
                    </div>

                    {/* Category */}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="backdrop-blur-sm">
                        {campaign.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {campaign.location}
                    </div>

                    <h3 className="font-display font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {campaign.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      by {campaign.organization}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold">
                          ${campaign.raised.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          of ${campaign.goal.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(campaign.raised / campaign.goal) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {campaign.donors} donors
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {campaign.daysLeft} days left
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
