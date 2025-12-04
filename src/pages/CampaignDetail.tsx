import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Users,
  Clock,
  Verified,
  TrendingUp,
  ExternalLink,
  MessageCircle,
  Image as ImageIcon,
  ThumbsUp,
  Send,
  Shield,
  Calendar,
} from "lucide-react";

const campaignData = {
  id: 1,
  title: "Clean Water for Rural Vietnam",
  organization: {
    name: "WaterAid Vietnam",
    avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60",
    verified: true,
    reputation: 4.9,
    campaigns: 23,
  },
  image: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=1200&auto=format&fit=crop&q=80",
  raised: 45000,
  goal: 60000,
  donorCount: 892,
  daysLeft: 12,
  location: "Mekong Delta, Vietnam",
  category: "Water & Sanitation",
  verified: true,
  trending: true,
  description: `Access to clean water is a fundamental human right, yet millions of people in rural Vietnam still lack this basic necessity. Our campaign aims to bring sustainable water solutions to 15 villages in the Mekong Delta region.

**The Challenge:**
- 40% of families rely on contaminated water sources
- Children miss school due to waterborne diseases
- Women spend hours daily collecting water

**Our Solution:**
We will install community water filtration systems, dig wells, and train local technicians for maintenance. Each system serves approximately 200 families.

**Your Impact:**
- $25 provides clean water for one family for a year
- $100 funds a community hand pump
- $500 sponsors a village filtration system`,
  updates: [
    {
      id: 1,
      date: "2024-01-15",
      title: "First village installation complete!",
      content: "We're thrilled to announce that the water system in Tan Phu village is now operational, serving 180 families!",
      image: "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=800&auto=format&fit=crop&q=60",
      likes: 234,
      comments: 45,
    },
    {
      id: 2,
      date: "2024-01-10",
      title: "Equipment arrived",
      content: "All filtration equipment has arrived at the regional warehouse. Installation begins next week!",
      likes: 156,
      comments: 23,
    },
  ],
  recentDonors: [
    { name: "Sarah M.", amount: 500, date: "2 hours ago", message: "Keep up the amazing work!" },
    { name: "Anonymous", amount: 1000, date: "5 hours ago", message: "" },
    { name: "John D.", amount: 250, date: "1 day ago", message: "For the children" },
  ],
  transactions: [
    { hash: "0x1234...abcd", type: "Donation", amount: 500, date: "2 hours ago" },
    { hash: "0x5678...efgh", type: "Donation", amount: 1000, date: "5 hours ago" },
    { hash: "0x9abc...ijkl", type: "Expense", amount: -2500, date: "3 days ago", note: "Equipment purchase" },
  ],
};

const CampaignDetail = () => {
  const { id } = useParams();
  const [comment, setComment] = useState("");
  const campaign = campaignData;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/campaigns">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
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
              </motion.div>

              {/* Title & Organization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  {campaign.location}
                  <span className="mx-2">•</span>
                  <Badge variant="secondary">{campaign.category}</Badge>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  {campaign.title}
                </h1>

                {/* Organization */}
                <div className="flex items-center gap-3 p-4 glass-card">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={campaign.organization.avatar} />
                    <AvatarFallback>{campaign.organization.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{campaign.organization.name}</span>
                      {campaign.organization.verified && (
                        <Verified className="w-4 h-4 text-success" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ⭐ {campaign.organization.reputation} • {campaign.organization.campaigns} campaigns
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Tabs defaultValue="story" className="w-full">
                  <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                    <TabsTrigger
                      value="story"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Story
                    </TabsTrigger>
                    <TabsTrigger
                      value="updates"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Updates ({campaign.updates.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="transactions"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                      On-Chain Ledger
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="story" className="pt-6">
                    <div className="prose prose-neutral max-w-none">
                      {campaign.description.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="mb-4 text-muted-foreground whitespace-pre-line">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="updates" className="pt-6 space-y-6">
                    {campaign.updates.map((update) => (
                      <div key={update.id} className="glass-card p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="w-4 h-4" />
                          {update.date}
                        </div>
                        <h3 className="font-display font-semibold text-lg mb-2">
                          {update.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">{update.content}</p>
                        {update.image && (
                          <img
                            src={update.image}
                            alt={update.title}
                            className="w-full h-48 object-cover rounded-xl mb-4"
                          />
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            {update.likes}
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            {update.comments}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Comment Input */}
                    <div className="glass-card p-4">
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Write a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="mb-3"
                          />
                          <div className="flex justify-between">
                            <Button variant="ghost" size="sm">
                              <ImageIcon className="w-4 h-4" />
                              Add Photo
                            </Button>
                            <Button size="sm">
                              <Send className="w-4 h-4" />
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="transactions" className="pt-6">
                    <div className="glass-card overflow-hidden">
                      <div className="p-4 bg-muted/50 border-b flex items-center gap-2">
                        <Shield className="w-5 h-5 text-success" />
                        <span className="font-medium">All transactions recorded on blockchain</span>
                      </div>
                      <div className="divide-y">
                        {campaign.transactions.map((tx, index) => (
                          <div key={index} className="p-4 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{tx.hash}</span>
                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {tx.type} {tx.note && `• ${tx.note}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-semibold ${
                                  tx.amount > 0 ? "text-success" : "text-destructive"
                                }`}
                              >
                                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">{tx.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Donation Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 sticky top-24"
              >
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-display text-3xl font-bold">
                      ${campaign.raised.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      of ${campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={(campaign.raised / campaign.goal) * 100}
                    className="h-3 mb-2"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{Math.round((campaign.raised / campaign.goal) * 100)}% funded</span>
                    <span>{campaign.daysLeft} days left</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="font-semibold">{campaign.donorCount}</div>
                    <div className="text-xs text-muted-foreground">Donors</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-secondary" />
                    <div className="font-semibold">{campaign.daysLeft}</div>
                    <div className="text-xs text-muted-foreground">Days Left</div>
                  </div>
                </div>

                {/* Donation Buttons */}
                <Button variant="hero" size="lg" className="w-full mb-3">
                  <Heart className="w-5 h-5" fill="currentColor" />
                  Donate Now
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4" />
                  Share Campaign
                </Button>

                {/* Recent Donors */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Recent Donors</h4>
                  <div className="space-y-3">
                    {campaignData.recentDonors.map((donor, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{donor.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{donor.name}</span>
                            <span className="text-sm font-semibold text-primary">
                              ${donor.amount}
                            </span>
                          </div>
                          {donor.message && (
                            <p className="text-xs text-muted-foreground truncate">
                              "{donor.message}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default CampaignDetail;
