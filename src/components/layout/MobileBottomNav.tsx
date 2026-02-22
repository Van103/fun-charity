import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Newspaper,
  Users,
  MessageCircle,
  Menu,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedNotifications } from "@/hooks/useUnifiedNotifications";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Scale,
  LayoutDashboard,
  ExternalLink,
  Download,
} from "lucide-react";
import { useInstallPWA } from "@/hooks/useInstallPWA";
import funProfileLogo from "@/assets/fun-profile-logo.webp";
import funPlayLogo from "@/assets/fun-play-logo-new.png";
import funPlanetLogo from "@/assets/fun-planet-logo.png";
import funFarmLogo from "@/assets/fun-farm-logo-new.png";
import funWalletLogo from "@/assets/fun-wallet-logo.png";
import funAcademyLogo from "@/assets/fun-academy-logo.png";
import funTreasuryLogo from "@/assets/fun-treasury-logo.png";
import funGreenEarthLogo from "@/assets/fun-greenearth-logo.png";
import funEcosystemLogo from "@/assets/fun-ecosystem-logo.png";

const mainNavItems = [
  { icon: Home, labelKey: "nav.home", href: "/social" },
  { icon: Newspaper, labelKey: "nav.campaigns", href: "/campaigns" },
  { icon: Users, labelKey: "nav.communityProfiles", href: "/profiles" },
  { icon: MessageCircle, labelKey: "nav.chat", href: "/messages" },
];

interface MenuItem {
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  labelKey: string;
  href: string;
  external: boolean;
}

const menuItems: MenuItem[] = [
  { image: funProfileLogo, labelKey: "menu.profile", href: "https://fun.rich/", external: true },
  { image: funFarmLogo, labelKey: "menu.farm", href: "https://farm.fun.rich/", external: true },
  { image: funPlanetLogo, labelKey: "menu.planet", href: "https://planet.fun.rich/", external: true },
  { image: funPlayLogo, labelKey: "menu.play", href: "https://play.fun.rich/", external: true },
  { image: funWalletLogo, labelKey: "menu.wallet", href: "https://wallet.fun.rich/", external: true },
  { image: funAcademyLogo, labelKey: "menu.academy", href: "https://academy.fun.rich/", external: true },
  { image: funTreasuryLogo, labelKey: "menu.treasury", href: "https://treasury.fun.rich/", external: true },
  { image: funGreenEarthLogo, labelKey: "menu.greenearth", href: "https://greenearth-fun.lovable.app/", external: true },
  { icon: MessageCircle, labelKey: "menu.chat", href: "/messages", external: false },
  { icon: Scale, labelKey: "menu.legal", href: "/legal", external: false },
];

const platformItems = [
  { icon: Newspaper, labelKey: "nav.campaigns", href: "/campaigns" },
  { icon: LayoutDashboard, labelKey: "nav.overview", href: "/dashboard" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const { showInstallOption, isIOS, promptInstall } = useInstallPWA();
  const { unreadCount: notifUnreadCount } = useUnifiedNotifications(userId);

  // Get user ID and fetch unread message count
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user.id);

      setUnreadCount(count || 0);
    };

    fetchData();

    const channel = supabase
      .channel('unread-messages-mobile')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          const isChat = item.labelKey === "nav.chat";
          const isHome = item.labelKey === "nav.home";
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full py-1.5 relative"
            >
              {/* Active indicator line - like Facebook */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    layoutId="activeIndicator"
                  />
                )}
              </AnimatePresence>
              
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-xl transition-colors relative"
              >
                <Icon 
                  className={`w-6 h-6 transition-colors relative z-10 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  fill={isActive ? "hsl(var(--primary))" : "none"}
                  strokeWidth={isActive ? 0 : 2}
                />
                
                {/* Unread badge for Chat icon */}
                {isChat && unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 z-20"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                )}
                
                {/* Notification badge for Home icon */}
                {isHome && notifUnreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 z-20"
                  >
                    {notifUnreadCount > 99 ? "99+" : notifUnreadCount}
                  </motion.span>
                )}
              </motion.div>
              <span className={`text-[10px] mt-0.5 font-medium truncate max-w-[56px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}

        {/* Menu Button with Sheet */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center flex-1 h-full py-1.5"
            >
              <div className="p-1.5 rounded-xl">
                <Menu className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium text-muted-foreground">
                {t("common.menu")}
              </span>
            </motion.button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="pb-4 border-b border-border">
              <SheetTitle className="text-lg font-bold text-center">
                {t("sidebar.ecosystem")}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(85vh-80px)] py-4">
              {/* Platform Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
                  {t("nav.platform")}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {platformItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`p-2.5 rounded-full mb-2 ${
                          isActive ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-center leading-tight">
                          {t(item.labelKey)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Install App Section */}
              {showInstallOption && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
                    {t("install.title") || "Cài đặt App"}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {isIOS ? (
                      <Link
                        to="/install"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all"
                      >
                        <div className="p-3 rounded-full bg-primary/20">
                          <Download className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{t("install.installApp") || "Cài đặt FUN Charity"}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("install.iosHint") || "Xem hướng dẫn cài đặt trên iOS"}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <button
                        onClick={async () => {
                          await promptInstall();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all text-left"
                      >
                        <div className="p-3 rounded-full bg-primary/20">
                          <Download className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{t("install.installApp") || "Cài đặt FUN Charity"}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("install.androidHint") || "Thêm vào màn hình chính"}
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FUN Ecosystem Section */}
              <div className="mb-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative mb-2">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 via-blue-400/30 to-pink-500/30 blur-md scale-110" />
                    <img 
                      src={funEcosystemLogo} 
                      alt="FUN ECOSYSTEM" 
                      className="relative w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/40 shadow-lg" 
                    />
                  </div>
                  <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                    FUN ECOSYSTEM PLATFORMS
                  </h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = !item.external && location.pathname === item.href;
                    
                    if (item.external) {
                      return (
                        <a
                          key={item.labelKey}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex flex-col items-center p-3 rounded-xl hover:bg-muted transition-all relative"
                        >
                          <div className="relative mb-2">
                            {item.image ? (
                              <>
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-champagne via-yellow-300 to-gold-dark opacity-50 blur-[1px] scale-105" />
                                <img 
                                  src={item.image} 
                                  alt="" 
                                  className="relative w-10 h-10 rounded-full object-cover ring-2 ring-gold-champagne/40 shadow-md" 
                                />
                              </>
                            ) : Icon ? (
                              <div className="p-2 rounded-full bg-muted">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                            ) : null}
                          </div>
                          <span 
                            className="text-xs font-bold text-center leading-tight text-purple-600"
                            style={{ fontSize: '12px' }}
                          >
                            {t(item.labelKey)}
                          </span>
                          <ExternalLink className="w-3 h-3 absolute top-2 right-2 text-muted-foreground" />
                        </a>
                      );
                    }
                    
                    return (
                      <Link
                        key={item.labelKey}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`relative mb-2 ${isActive ? "" : ""}`}>
                          {item.image ? (
                            <>
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-champagne via-yellow-300 to-gold-dark opacity-50 blur-[1px] scale-105" />
                              <img 
                                src={item.image} 
                                alt="" 
                                className="relative w-10 h-10 rounded-full object-cover ring-2 ring-gold-champagne/40 shadow-md" 
                              />
                            </>
                          ) : Icon ? (
                            <div className={`p-2 rounded-full ${isActive ? "bg-primary/20" : "bg-muted"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                          ) : null}
                        </div>
                        <span 
                          className="text-xs font-bold text-center leading-tight text-purple-600"
                          style={{ fontSize: '12px' }}
                        >
                          {t(item.labelKey)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
