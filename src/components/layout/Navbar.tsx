import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Menu,
  X,
  Search,
  Bell,
  User,
  Sparkles,
  HandHeart,
  LayoutDashboard,
  Wallet,
} from "lucide-react";

const navItems = [
  { name: "Campaigns", path: "/campaigns", icon: HandHeart },
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Need Map", path: "/need-map", icon: Search },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
                <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent animate-pulse" />
            </div>
            <span className="font-display font-bold text-xl">
              <span className="gradient-text">FUN</span>
              <span className="text-foreground">Charity</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={isActive ? "bg-primary/10 text-primary" : ""}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            
            <Button variant="glass" size="sm" className="gap-2">
              <Wallet className="w-4 h-4" />
              <span className="font-mono">0.00 ETH</span>
            </Button>

            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button variant="hero" size="sm">
                Start Giving
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              <div className="pt-4 space-y-2 border-t border-border">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
                <Button variant="hero" className="w-full">
                  Start Giving
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
