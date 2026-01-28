import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  UserPlus, 
  Users,
  Loader2,
  Check,
  X
} from "lucide-react";
import { useGroupManagement } from "@/hooks/useGroupManagement";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface ManageGroupMembersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string | null;
}

interface Friend {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  username: string | null;
}

export function ManageGroupMembers({ 
  open, 
  onOpenChange, 
  conversationId 
}: ManageGroupMembersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const { group, addMember, isAddingMember } = useGroupManagement(conversationId);

  // Fetch friends list
  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ['friends-for-group', conversationId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get accepted friendships
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .eq('status', 'accepted')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      // Get unique friend IDs
      const friendIds = friendships.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      if (friendIds.length === 0) return [];

      // Get friend profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', friendIds);

      // Map to Friend type with null username
      return (profiles || []).map(p => ({
        ...p,
        username: null,
      })) as Friend[];
    },
    enabled: open,
  });

  // Filter friends not already in group
  const availableFriends = friends?.filter(friend => 
    !group?.members.some(m => m.user_id === friend.user_id)
  ) || [];

  // Filter by search
  const filteredFriends = availableFriends.filter(friend =>
    friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    setIsAdding(true);
    try {
      for (const userId of selectedUsers) {
        await new Promise<void>((resolve, reject) => {
          addMember(userId, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          });
        });
      }
      setSelectedUsers([]);
      onOpenChange(false);
      toast.success(`Đã thêm ${selectedUsers.length} thành viên`);
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedUsers([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Thêm thành viên
          </DialogTitle>
          <DialogDescription>
            Chọn bạn bè để thêm vào nhóm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Selected count */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Đã chọn: {selectedUsers.length}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedUsers([])}
                className="h-6 text-xs"
              >
                Bỏ chọn tất cả
              </Button>
            </div>
          )}

          {/* Friends list */}
          <ScrollArea className="h-[300px]">
            {isLoadingFriends ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery 
                    ? 'Không tìm thấy bạn bè phù hợp'
                    : 'Tất cả bạn bè đã ở trong nhóm'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {filteredFriends.map((friend) => {
                    const isSelected = selectedUsers.includes(friend.user_id);
                    
                    return (
                      <motion.div
                        key={friend.user_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleSelect(friend.user_id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(friend.user_id)}
                          className="pointer-events-none"
                        />
                        
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={friend.avatar_url || undefined} />
                          <AvatarFallback>
                            {friend.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {friend.full_name || 'Người dùng'}
                          </p>
                          {friend.username && (
                            <p className="text-xs text-muted-foreground truncate">
                              @{friend.username}
                            </p>
                          )}
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || isAdding}
              className="flex-1"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Thêm ({selectedUsers.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
