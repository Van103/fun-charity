import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  MapPin,
  Users,
  Clock,
  Verified,
  TrendingUp,
  Heart,
} from "lucide-react";

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
  {
    id: 4,
    title: "Medical Supplies for Remote Clinics",
    organization: "Health Without Borders",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
    raised: 32000,
    goal: 50000,
    donors: 678,
    daysLeft: 18,
    location: "Philippines",
    category: "Healthcare",
    verified: true,
    trending: false,
  },
  {
    id: 5,
    title: "Shelter for Homeless Families",
    organization: "Home Again Initiative",
    image: "https://images.unsplash.com/photo-1469022563428-aa04fef9f5a2?w=800&auto=format&fit=crop&q=60",
    raised: 67000,
    goal: 80000,
    donors: 1234,
    daysLeft: 8,
    location: "Brazil",
    category: "Housing",
    verified: true,
    trending: true,
  },
  {
    id: 6,
    title: "Reforestation Project Amazon",
    organization: "Green Earth Alliance",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=60",
    raised: 120000,
    goal: 150000,
    donors: 3456,
    daysLeft: 30,
    location: "Brazil",
    category: "Environment",
    verified: true,
    trending: true,
  },
];

const categories = [
  "All Categories",
  "Water & Sanitation",
  "Education",
  "Hunger Relief",
  "Healthcare",
  "Housing",
  "Environment",
];

const Campaigns = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="trending" className="mb-4">
              <Heart className="w-3.5 h-3.5 mr-1" />
              Make an Impact
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Discover <span className="gradient-text">Campaigns</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse verified campaigns from trusted NGOs around the world.
              Every donation is tracked on-chain for full transparency.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No campaigns found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Campaigns;
