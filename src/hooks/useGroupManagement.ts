import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GroupSettings {
  only_admins_can_add_members: boolean;
  only_admins_can_edit: boolean;
  require_approval: boolean;
}

interface GroupMember {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  nickname: string | null;
  added_by: string | null;
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    username: string | null;
  };
}

interface GroupConversation {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_group: boolean;
  created_by: string | null;
  settings: GroupSettings;
  members: GroupMember[];
}

export function useGroupManagement(conversationId: string | null) {
  const queryClient = useQueryClient();

  // Fetch group details with members
  const { data: group, isLoading } = useQuery({
    queryKey: ['group-management', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;

      // Fetch conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id, name, avatar_url, is_group, created_by, settings')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;
      if (!conversation.is_group) return null;

      // Fetch members with profiles
      const { data: participants, error: partError } = await supabase
        .from('conversation_participants')
        .select(`
          id,
          user_id,
          role,
          nickname,
          added_by,
          joined_at
        `)
        .eq('conversation_id', conversationId);

      if (partError) throw partError;

      // Fetch profiles for all members
      const userIds = participants.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(
        profiles?.map(p => [p.user_id, { ...p, username: null }]) || []
      );

      const members: GroupMember[] = participants.map(p => ({
        ...p,
        role: (p.role || 'member') as 'admin' | 'moderator' | 'member',
        profile: profilesMap.get(p.user_id) || undefined,
      }));

      const defaultSettings: GroupSettings = {
        only_admins_can_add_members: false,
        only_admins_can_edit: false,
        require_approval: false,
      };
      
      const parsedSettings = conversation.settings && typeof conversation.settings === 'object'
        ? { ...defaultSettings, ...(conversation.settings as Partial<GroupSettings>) }
        : defaultSettings;

      return {
        ...conversation,
        settings: parsedSettings,
        members,
      } as GroupConversation;
    },
    enabled: !!conversationId,
  });

  // Check current user's role
  const { data: currentUserRole } = useQuery({
    queryKey: ['group-user-role', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('conversation_participants')
        .select('role')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .single();

      return (data?.role || 'member') as 'admin' | 'moderator' | 'member';
    },
    enabled: !!conversationId,
  });

  // Add member
  const addMember = useMutation({
    mutationFn: async (userId: string) => {
      if (!conversationId) throw new Error('No conversation selected');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          role: 'member',
          added_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-management', conversationId] });
      toast.success('Đã thêm thành viên');
    },
    onError: (error) => {
      toast.error('Không thể thêm thành viên');
      console.error(error);
    },
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      if (!conversationId) throw new Error('No conversation selected');

      const { error } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-management', conversationId] });
      toast.success('Đã xóa thành viên');
    },
    onError: (error) => {
      toast.error('Không thể xóa thành viên');
      console.error(error);
    },
  });

  // Update member role
  const updateMemberRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'moderator' | 'member' }) => {
      if (!conversationId) throw new Error('No conversation selected');

      const { error } = await supabase
        .from('conversation_participants')
        .update({ role })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-management', conversationId] });
      toast.success('Đã cập nhật vai trò');
    },
    onError: (error) => {
      toast.error('Không thể cập nhật vai trò');
      console.error(error);
    },
  });

  // Update group name
  const updateGroupName = useMutation({
    mutationFn: async (name: string) => {
      if (!conversationId) throw new Error('No conversation selected');

      const { error } = await supabase
        .from('conversations')
        .update({ name })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-management', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Đã cập nhật tên nhóm');
    },
    onError: (error) => {
      toast.error('Không thể cập nhật tên nhóm');
      console.error(error);
    },
  });

  // Update group avatar
  const updateGroupAvatar = useMutation({
    mutationFn: async (avatarUrl: string) => {
      if (!conversationId) throw new Error('No conversation selected');

      const { error } = await supabase
        .from('conversations')
        .update({ avatar_url: avatarUrl })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-management', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Đã cập nhật ảnh nhóm');
    },
    onError: (error) => {
      toast.error('Không thể cập nhật ảnh nhóm');
      console.error(error);
    },
  });

  // Update group settings
  const updateGroupSettings = useMutation({
    mutationFn: async (settings: Partial<GroupSettings>) => {
      if (!conversationId) throw new Error('No conversation selected');

      const currentSettings = group?.settings || {};
      const newSettings = { ...currentSettings, ...settings };

      const { error } = await supabase
        .from('conversations')
        .update({ settings: newSettings })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-management', conversationId] });
      toast.success('Đã cập nhật cài đặt nhóm');
    },
    onError: (error) => {
      toast.error('Không thể cập nhật cài đặt nhóm');
      console.error(error);
    },
  });

  // Leave group
  const leaveGroup = useMutation({
    mutationFn: async () => {
      if (!conversationId) throw new Error('No conversation selected');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Đã rời khỏi nhóm');
    },
    onError: (error) => {
      toast.error('Không thể rời khỏi nhóm');
      console.error(error);
    },
  });

  // Delete group (admin only)
  const deleteGroup = useMutation({
    mutationFn: async () => {
      if (!conversationId) throw new Error('No conversation selected');

      // Delete all participants first
      await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId);

      // Delete all messages
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Delete conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Đã xóa nhóm');
    },
    onError: (error) => {
      toast.error('Không thể xóa nhóm');
      console.error(error);
    },
  });

  // Computed permissions
  const isGroupAdmin = currentUserRole === 'admin';
  const isGroupModerator = currentUserRole === 'moderator';
  const canManageMembers = isGroupAdmin || (isGroupModerator && !group?.settings?.only_admins_can_add_members);
  const canEditGroup = isGroupAdmin || (isGroupModerator && !group?.settings?.only_admins_can_edit);

  return {
    group,
    isLoading,
    currentUserRole,
    
    // Actions
    addMember: addMember.mutate,
    isAddingMember: addMember.isPending,
    
    removeMember: removeMember.mutate,
    isRemovingMember: removeMember.isPending,
    
    updateMemberRole: updateMemberRole.mutate,
    isUpdatingRole: updateMemberRole.isPending,
    
    updateGroupName: updateGroupName.mutate,
    isUpdatingName: updateGroupName.isPending,
    
    updateGroupAvatar: updateGroupAvatar.mutate,
    isUpdatingAvatar: updateGroupAvatar.isPending,
    
    updateGroupSettings: updateGroupSettings.mutate,
    isUpdatingSettings: updateGroupSettings.isPending,
    
    leaveGroup: leaveGroup.mutate,
    isLeaving: leaveGroup.isPending,
    
    deleteGroup: deleteGroup.mutate,
    isDeleting: deleteGroup.isPending,
    
    // Permissions
    isGroupAdmin,
    isGroupModerator,
    canManageMembers,
    canEditGroup,
  };
}
