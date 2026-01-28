import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Users, 
  Camera, 
  Edit3, 
  Bell, 
  Pin, 
  Shield, 
  LogOut, 
  Trash2,
  UserPlus,
  Crown,
  Star,
  User,
  MoreVertical,
  Loader2,
  Check,
  X
} from "lucide-react";
import { useGroupManagement } from "@/hooks/useGroupManagement";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface GroupSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string | null;
  onAddMemberClick?: () => void;
}

export function GroupSettingsPanel({ 
  open, 
  onOpenChange, 
  conversationId,
  onAddMemberClick
}: GroupSettingsPanelProps) {
  const {
    group,
    isLoading,
    currentUserRole,
    isGroupAdmin,
    canManageMembers,
    canEditGroup,
    updateGroupName,
    isUpdatingName,
    updateGroupSettings,
    isUpdatingSettings,
    updateMemberRole,
    removeMember,
    leaveGroup,
    isLeaving,
    deleteGroup,
    isDeleting,
  } = useGroupManagement(conversationId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const handleSaveName = () => {
    if (newName.trim()) {
      updateGroupName(newName.trim());
      setIsEditingName(false);
    }
  };

  const handleLeaveGroup = () => {
    leaveGroup();
    setShowLeaveDialog(false);
    onOpenChange(false);
  };

  const handleDeleteGroup = () => {
    deleteGroup();
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Star className="w-3 h-3 mr-1" />
            Mod
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading || !group) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Cài đặt nhóm
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4 space-y-6">
              {/* Group Info */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={group.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {group.name?.charAt(0) || 'G'}
                    </AvatarFallback>
                  </Avatar>
                  {canEditGroup && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                    >
                      <Camera className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="mt-3">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="text-center"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={isUpdatingName}>
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{group.name || 'Nhóm chat'}</h3>
                      {canEditGroup && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6"
                          onClick={() => {
                            setNewName(group.name || '');
                            setIsEditingName(true);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {group.members.length} thành viên • Bạn là {
                      currentUserRole === 'admin' ? 'Admin' : 
                      currentUserRole === 'moderator' ? 'Moderator' : 'Thành viên'
                    }
                  </p>
                </div>
              </div>

              <Separator />

              {/* Members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <Label className="font-medium">Thành viên ({group.members.length})</Label>
                  </div>
                  {canManageMembers && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs"
                      onClick={onAddMemberClick}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Thêm
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {member.profile?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {member.nickname || member.profile?.full_name || 'Người dùng'}
                            </span>
                            {getRoleBadge(member.role)}
                          </div>
                          {member.profile?.username && (
                            <span className="text-xs text-muted-foreground">
                              @{member.profile.username}
                            </span>
                          )}
                        </div>
                      </div>

                      {isGroupAdmin && member.role !== 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => updateMemberRole({ userId: member.user_id, role: 'admin' })}
                            >
                              <Crown className="w-4 h-4 mr-2 text-amber-500" />
                              Đặt làm Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateMemberRole({ 
                                userId: member.user_id, 
                                role: member.role === 'moderator' ? 'member' : 'moderator' 
                              })}
                            >
                              <Star className="w-4 h-4 mr-2 text-blue-500" />
                              {member.role === 'moderator' ? 'Bỏ Moderator' : 'Đặt làm Moderator'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => removeMember(member.user_id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa khỏi nhóm
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Admin Settings */}
              {isGroupAdmin && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <Label className="font-medium">Quyền Admin</Label>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Chỉ admin được thêm thành viên</Label>
                        <Switch
                          checked={group.settings?.only_admins_can_add_members}
                          onCheckedChange={(checked) => 
                            updateGroupSettings({ only_admins_can_add_members: checked })
                          }
                          disabled={isUpdatingSettings}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Chỉ admin được đổi thông tin nhóm</Label>
                        <Switch
                          checked={group.settings?.only_admins_can_edit}
                          onCheckedChange={(checked) => 
                            updateGroupSettings({ only_admins_can_edit: checked })
                          }
                          disabled={isUpdatingSettings}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Phê duyệt thành viên mới</Label>
                        <Switch
                          checked={group.settings?.require_approval}
                          onCheckedChange={(checked) => 
                            updateGroupSettings({ require_approval: checked })
                          }
                          disabled={isUpdatingSettings}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => setShowLeaveDialog(true)}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Rời khỏi nhóm
                </Button>

                {isGroupAdmin && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa nhóm
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Leave Group Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời khỏi nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sẽ không còn nhận được tin nhắn từ nhóm này. 
              Bạn có thể được thêm lại bởi thành viên khác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLeaveGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLeaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rời nhóm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Group Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tất cả tin nhắn và dữ liệu của nhóm sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa nhóm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
