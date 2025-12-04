import { Link } from "react-router-dom";
import { Heart, Twitter, Github, Linkedin, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  Platform: [
    { name: "Campaigns", href: "/campaigns" },
    { name: "Need Map", href: "/need-map" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "How It Works", href: "/how-it-works" },
  ],
  Community: [
    { name: "For Donors", href: "/donors" },
    { name: "For Volunteers", href: "/volunteers" },
    { name: "For NGOs", href: "/ngos" },
    { name: "Leaderboard", href: "/leaderboard" },
  ],
  Resources: [
    { name: "Documentation", href: "/docs" },
    { name: "API", href: "/api" },
    { name: "Blog", href: "/blog" },
    { name: "Support", href: "/support" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Github, href: "https://github.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
  { icon: Mail, href: "mailto:hello@funcharity.org" },
];

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display font-bold text-xl">
                <span className="gradient-text">FUN</span>Charity
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              Web3 Social Charity Platform connecting Donors, Volunteers, and NGOs for transparent, impactful giving.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Icon className="w-4 h-4" />
                    </Button>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 FUN Charity. All rights reserved. Built with{" "}
            <Heart className="inline w-3 h-3 text-primary" fill="currentColor" /> on Web3.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Powered by transparent blockchain technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
