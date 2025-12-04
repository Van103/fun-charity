import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Building2, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: Heart,
    title: "For Donors",
    description: "Give with confidence. Track impact. Earn recognition.",
    cta: "Start Giving",
    href: "/campaigns",
    gradient: "from-primary to-accent",
  },
  {
    icon: Users,
    title: "For Volunteers",
    description: "Find opportunities. Build skills. Make a difference.",
    cta: "Join as Volunteer",
    href: "/volunteers",
    gradient: "from-secondary to-secondary-light",
  },
  {
    icon: Building2,
    title: "For NGOs",
    description: "Launch campaigns. Build trust. Grow your impact.",
    cta: "Register NGO",
    href: "/ngos",
    gradient: "from-success to-secondary",
  },
];

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={role.href}>
                  <div className="glass-card-hover p-8 h-full group">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {role.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {role.description}
                    </p>
                    <Button variant="outline" className="group/btn">
                      {role.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 gradient-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.2),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.1),_transparent_50%)]" />

          {/* Content */}
          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <Sparkles className="w-12 h-12 text-primary-foreground/80 mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of donors, volunteers, and NGOs creating transparent,
              lasting impact through Web3 technology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/campaigns">
                <Button variant="hero-outline" size="xl">
                  <Heart className="w-5 h-5" fill="currentColor" />
                  Browse Campaigns
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="xl"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Explore Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
