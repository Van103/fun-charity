import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, MessageCircle, Archive, Users, Bot, ChevronRight, 
  ExternalLink, ChevronDown, Sparkles, Activity, Shield, User, Lock, ShieldCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAngelAI } from "@/hooks/useAngelAI";
import { AngelAIChatModal } from "@/components/angel/AngelAIChatModal";
import { useState } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";

// Import FUN Ecosystem logos
import funProfileLogo from "@/assets/fun-profile-logo.webp";
import funPlayLogo from "@/assets/fun-play-logo-new.png";
import funPlanetLogo from "@/assets/fun-planet-logo.png";
import funFarmLogo from "@/assets/fun-farm-logo-new.png";
import funWalletLogo from "@/assets/fun-wallet-logo.png";
import funAcademyLogo from "@/assets/fun-academy-logo.png";
import funTreasuryLogo from "@/assets/fun-treasury-logo.png";
import funGreenEarthLogo from "@/assets/fun-greenearth-logo.png";
import funEcosystemLogo from "@/assets/fun-ecosystem-logo.png";

interface ChatMenuTabProps {
  userProfile: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    username?: string | null;
  } | null;
  pendingMessagesCount?: number;
  friendRequestsCount?: number;
  onNavigate?: (destination: string) => void;
}

const ecosystemPlatforms = [
  { image: funProfileLogo, label: "FUN PROFILE", href: "https://fun.rich/", external: true },
  { image: funFarmLogo, label: "FUN FARM", href: "https://farm.fun.rich/", external: true },
  { image: funPlanetLogo, label: "FUN PLANET", href: "https://planet.fun.rich/", external: true },
  { image: funPlayLogo, label: "FUN PLAY", href: "https://play.fun.rich/", external: true },
  { image: funWalletLogo, label: "FUN WALLET", href: "https://wallet.fun.rich/", external: true },
  { image: funAcademyLogo, label: "FUN ACADEMY", href: "https://academy.fun.rich/", external: true },
  { image: funTreasuryLogo, label: "FUN TREASURY", href: "https://treasury.fun.rich/", external: true },
  { image: funGreenEarthLogo, label: "GREEN EARTH", href: "https://greenearth-fun.lovable.app/", external: true },
];

const settingsSubItems = [
  { icon: Sparkles, labelKey: "chat.settingsFeatures", href: "#features" },
  { icon: Activity, labelKey: "chat.settingsActivityStatus", href: "#activity-status" },
  { icon: Shield, labelKey: "chat.settingsPrivacy", href: "#privacy" },
  { icon: User, labelKey: "chat.settingsPersonalInfo", href: "#personal-info" },
  { icon: Lock, labelKey: "chat.settingsPassword", href: "#password" },
];

export function ChatMenuTab({ 
  userProfile, 
  pendingMessagesCount = 0, 
  friendRequestsCount = 0,
  onNavigate 
}: ChatMenuTabProps) {
  const { t } = useLanguage();
  const [showAngelAI, setShowAngelAI] = useState(false);
  const [showSettingsSubmenu, setShowSettingsSubmenu] = useState(false);
  const angelAI = useAngelAI();
  const { data: isAdmin } = useAdminCheck();

  const menuSections = [
    {
      items: [
        { 
          icon: MessageCircle, 
          labelKey: "chat.pendingMessages", 
          href: "#pending",
          badge: pendingMessagesCount > 0 ? pendingMessagesCount : null,
          badgeVariant: "default" as const
        },
        { 
          icon: Archive, 
          labelKey: "chat.archive", 
          href: "#archive",
          badge: null 
        },
      ]
    },
    {
      items: [
        { 
          icon: Users, 
          labelKey: "chat.friendRequests", 
          href: "/friends",
          badge: friendRequestsCount > 0 ? friendRequestsCount : null,
          badgeVariant: "destructive" as const
        },
        { 
          icon: Bot, 
          labelKey: "chat.chatWithAI", 
          href: "#angel-ai",
          badge: null,
          onClick: () => setShowAngelAI(true)
        },
      ]
    },
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <Link to="/profile" className="flex items-center gap-3 flex-1">
            <div className="relative">
              <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                <AvatarImage src={userProfile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {userProfile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {userProfile?.full_name || t('messages.user')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('chat.switchProfile')} · @{userProfile?.username || "user"}
              </p>
            </div>
          </Link>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </motion.div>

        {/* Settings Section with Collapsible Submenu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="bg-muted/30 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setShowSettingsSubmenu(!showSettingsSubmenu)}
            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="p-2 rounded-full bg-muted">
              <Settings className="w-5 h-5 text-foreground" />
            </div>
            <span className="flex-1 font-medium text-left">{t('chat.settings')}</span>
            <motion.div
              animate={{ rotate: showSettingsSubmenu ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showSettingsSubmenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pl-4 pb-2 space-y-1">
                  {settingsSubItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.labelKey}
                        onClick={() => onNavigate?.(item.href)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-sm text-left">{t(item.labelKey)}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                  
                  {/* Admin Moderation - Only show for admins */}
                  {isAdmin && (
                    <Link
                      to="/admin/moderation"
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span className="flex-1 text-sm text-left">{t('chat.settingsAdminModeration')}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Admin</Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (sectionIndex + 1) * 0.05 }}
            className="bg-muted/30 rounded-xl overflow-hidden"
          >
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-full bg-muted">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="flex-1 font-medium">{t(item.labelKey)}</span>
                  {item.badge && (
                    <Badge variant={item.badgeVariant || "default"} className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              );

              if (item.onClick) {
                return (
                  <button 
                    key={item.labelKey} 
                    onClick={item.onClick}
                    className="w-full text-left"
                  >
                    {content}
                  </button>
                );
              }

              if (item.href.startsWith("#")) {
                return (
                  <button 
                    key={item.labelKey} 
                    onClick={() => onNavigate?.(item.href)}
                    className="w-full text-left"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link key={item.labelKey} to={item.href}>
                  {content}
                </Link>
              );
            })}
          </motion.div>
        ))}

        {/* FUN Ecosystem Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="pt-2"
        >
          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-2">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 via-blue-400/30 to-pink-500/30 blur-md scale-110" />
              <img 
                src={funEcosystemLogo} 
                alt="FUN ECOSYSTEM" 
                className="relative w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/40 shadow-lg" 
              />
            </div>
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              FUN ECOSYSTEM PLATFORMS
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {ecosystemPlatforms.map((platform) => (
              <a
                key={platform.label}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-2 rounded-xl hover:bg-muted/50 transition-all relative"
              >
                <div className="relative mb-1.5">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-champagne via-yellow-300 to-gold-dark opacity-50 blur-[1px] scale-105" />
                  <img 
                    src={platform.image} 
                    alt={platform.label} 
                    className="relative w-10 h-10 rounded-full object-cover ring-2 ring-gold-champagne/40 shadow-md" 
                  />
                </div>
                <span className="text-[10px] font-bold text-center leading-tight text-purple-600">
                  {platform.label}
                </span>
                <ExternalLink className="w-2.5 h-2.5 absolute top-1 right-1 text-muted-foreground" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Angel AI Chat Modal */}
      <AngelAIChatModal
        isOpen={showAngelAI}
        onClose={() => setShowAngelAI(false)}
      />
    </ScrollArea>
  );
}
