import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Bell,
  BellOff,
  Palette,
  Edit3,
  Image as ImageIcon,
  File,
  Link2,
  Search,
  Shield,
  Trash2,
  LogOut,
  ChevronDown,
  Check,
  X,
  Loader2,
  Users,
  Video,
  Pin,
  Archive,
} from "lucide-react";
import { useConversationSettings } from "@/hooks/useConversationSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

interface ConversationUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface MediaMessage {
  id: string;
  image_url: string;
  created_at: string;
}

interface ChatSettingsPanelProps {
  conversationId: string;
  currentUserId: string;
  otherUser?: ConversationUser | null;
  isGroup?: boolean;
  groupName?: string;
  participants?: ConversationUser[];
  mediaMessages?: MediaMessage[];
  isOnline?: boolean;
  onClose?: () => void;
  onSearchClick?: () => void;
  onLeaveGroup?: () => void;
  onDeleteConversation?: () => void;
  onBlockUser?: () => void;
}

// Helper function to check if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv", ".m4v"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
};

export function ChatSettingsPanel({
  conversationId,
  currentUserId,
  otherUser,
  isGroup = false,
  groupName,
  participants = [],
  mediaMessages = [],
  isOnline = false,
  onClose,
  onSearchClick,
  onLeaveGroup,
  onDeleteConversation,
  onBlockUser,
}: ChatSettingsPanelProps) {
  const { t } = useLanguage();
  const {
    settings,
    isLoading,
    isSaving,
    toggleNotifications,
    updateThemeColor,
    updateNickname,
    themeColors,
  } = useConversationSettings(conversationId, currentUserId);

  const [showNicknameEdit, setShowNicknameEdit] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const handleNicknameSave = async () => {
    await updateNickname(nicknameInput.trim() || null);
    setShowNicknameEdit(false);
    setNicknameInput("");
  };

  const displayName = isGroup
    ? groupName || t("messages.groupChat")
    : settings?.nickname || otherUser?.full_name || t("messages.user");

  const images = mediaMessages.filter((m) => !isVideoUrl(m.image_url));
  const videos = mediaMessages.filter((m) => isVideoUrl(m.image_url));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        {/* Profile Section */}
        <div className="text-center mb-6">
          <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-primary/20">
            <AvatarImage src={otherUser?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {isGroup ? (
                <Users className="w-8 h-8" />
              ) : (
                displayName.charAt(0)
              )}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-lg">{displayName}</h3>
          {settings?.nickname && otherUser?.full_name && (
            <p className="text-xs text-muted-foreground">
              ({otherUser.full_name})
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {isOnline ? (
              <span className="flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {t("messages.online")}
              </span>
            ) : (
              t("messages.recentlyActive")
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4 mb-6">
          {!isGroup && otherUser && (
            <div className="text-center">
              <Link
                to={`/user/${otherUser.user_id}`}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 hover:bg-muted/80 transition-colors"
              >
                <Users className="w-5 h-5" />
              </Link>
              <span className="text-xs text-muted-foreground">
                {t("messages.profile")}
              </span>
            </div>
          )}
          <div className="text-center">
            <button
              onClick={toggleNotifications}
              disabled={isSaving}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {settings?.notifications_enabled ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              {settings?.notifications_enabled
                ? t("messages.mute")
                : t("messages.unmute")}
            </span>
          </div>
          <div className="text-center">
            <button
              onClick={onSearchClick}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 hover:bg-muted/80 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <span className="text-xs text-muted-foreground">
              {t("common.search")}
            </span>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-2">
          {/* Customize Chat */}
          <Collapsible open={customizeOpen} onOpenChange={setCustomizeOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("messages.customizeChat")}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  customizeOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 py-2 space-y-4">
              {/* Theme Color */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  {t("messages.changeTheme")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {themeColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateThemeColor(color.value)}
                      disabled={isSaving}
                      className="relative w-8 h-8 rounded-full transition-transform hover:scale-110 disabled:opacity-50"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {settings?.theme_color === color.value && (
                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nickname */}
              {!isGroup && (
                <div>
                  <button
                    onClick={() => {
                      setNicknameInput(settings?.nickname || "");
                      setShowNicknameEdit(true);
                    }}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm">
                      {settings?.nickname
                        ? `Biệt danh: ${settings.nickname}`
                        : t("messages.changeNickname")}
                    </span>
                  </button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Media & Files */}
          <Collapsible open={mediaOpen} onOpenChange={setMediaOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("messages.mediaFiles")}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  mediaOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 py-2 space-y-3">
              {/* Images */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Ảnh ({images.length})
                  </span>
                </div>
                {images.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("messages.noFiles")}</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {images.slice(0, 6).map((msg) => (
                      <img
                        key={msg.id}
                        src={msg.image_url}
                        alt="Media"
                        className="aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(msg.image_url, "_blank")}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              {videos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Video ({videos.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {videos.slice(0, 3).map((msg) => (
                      <div
                        key={msg.id}
                        className="aspect-square rounded-lg cursor-pointer hover:opacity-80 transition-opacity relative bg-muted overflow-hidden"
                        onClick={() => window.open(msg.image_url, "_blank")}
                      >
                        <video
                          src={msg.image_url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Privacy & Support */}
          <Collapsible open={privacyOpen} onOpenChange={setPrivacyOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("messages.privacySupport")}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  privacyOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 py-2 space-y-1">
              {/* Notification Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  {settings?.notifications_enabled ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                  <span className="text-sm">{t("messages.notifications")}</span>
                </div>
                <Switch
                  checked={settings?.notifications_enabled ?? true}
                  onCheckedChange={toggleNotifications}
                  disabled={isSaving}
                />
              </div>

              {/* Block User (1:1 only) */}
              {!isGroup && (
                <button
                  onClick={onBlockUser}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">{t("messages.block")}</span>
                </button>
              )}

              {/* Leave Group (group only) */}
              {isGroup && (
                <button
                  onClick={onLeaveGroup}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">{t("messages.leaveGroup")}</span>
                </button>
              )}

              {/* Delete Conversation */}
              <button
                onClick={onDeleteConversation}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">{t("messages.deleteConversation")}</span>
              </button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Nickname Edit Dialog */}
      <Dialog open={showNicknameEdit} onOpenChange={setShowNicknameEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("messages.changeNickname")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nickname" className="text-sm text-muted-foreground">
                Biệt danh cho {otherUser?.full_name || t("messages.user")}
              </Label>
              <Input
                id="nickname"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Nhập biệt danh..."
                className="mt-2"
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowNicknameEdit(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleNicknameSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}
