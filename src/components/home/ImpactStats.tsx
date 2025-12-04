import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Heart,
  Users,
  Globe,
  Droplets,
  GraduationCap,
  UtensilsCrossed,
  Home,
} from "lucide-react";

const impactCategories = [
  {
    icon: Droplets,
    title: "Clean Water",
    value: "125K+",
    description: "People with access to clean water",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: GraduationCap,
    title: "Education",
    value: "48K+",
    description: "Students supported",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: UtensilsCrossed,
    title: "Food Security",
    value: "890K+",
    description: "Meals provided",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Home,
    title: "Shelter",
    value: "12K+",
    description: "Families housed",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

export function ImpactStats() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg opacity-5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(var(--secondary)/0.1),_transparent_70%)]" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="success" className="mb-4">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Real Impact
          </Badge>
          <h2 className="font-display text-4xl font-bold mb-4">
            Together, We've Made a <span className="text-secondary">Difference</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every donation contributes to measurable impact. Track it all on-chain.
          </p>
        </div>

        {/* Impact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {impactCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 text-center group hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${category.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-7 h-7 ${category.color}`} />
                </div>
                <div className="font-display text-3xl font-bold mb-1">
                  {category.value}
                </div>
                <div className="font-medium text-foreground mb-1">
                  {category.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  {category.description}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <span className="font-medium">Live Activity</span>
          </div>
          
          <div className="space-y-3">
            {[
              { user: "Sarah M.", action: "donated $50 to", campaign: "Clean Water for Vietnam", time: "2 min ago" },
              { user: "John D.", action: "volunteered for", campaign: "Education Initiative", time: "5 min ago" },
              { user: "Anonymous", action: "donated 0.5 ETH to", campaign: "Food Relief Kenya", time: "8 min ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {activity.user[0]}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="text-primary font-medium">{activity.campaign}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
