import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecuritySettings {
  id: string;
  user_id: string;
  is_2fa_enabled: boolean;
  pin_hash: string | null;
  biometric_credential_id: string | null;
  biometric_public_key: string | null;
  created_at: string;
  updated_at: string;
}

export function useWalletSecurity() {
  const queryClient = useQueryClient();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch security settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['wallet-security-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching security settings:', error);
        return null;
      }

      return data as SecuritySettings | null;
    },
  });

  // Initialize settings if not exists
  const initializeSettings = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: user.id,
          is_2fa_enabled: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-security-settings'] });
    },
  });

  // Toggle 2FA
  const toggle2FA = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Ensure settings exist
      if (!settings) {
        await initializeSettings.mutateAsync();
      }

      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: user.id,
          is_2fa_enabled: enabled,
        });

      if (error) throw error;
      return enabled;
    },
    onSuccess: (enabled) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-security-settings'] });
      toast.success(enabled ? 'Đã bật xác thực 2 bước' : 'Đã tắt xác thực 2 bước');
    },
    onError: (error) => {
      toast.error('Không thể cập nhật cài đặt 2FA');
      console.error(error);
    },
  });

  // Set PIN code
  const setPinCode = useMutation({
    mutationFn: async (pin: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Simple hash for PIN (in production, use proper hashing)
      const pinHash = btoa(pin);

      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: user.id,
          pin_hash: pinHash,
        });

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-security-settings'] });
      toast.success('Đã thiết lập mã PIN');
      setIsPinModalOpen(false);
    },
    onError: (error) => {
      toast.error('Không thể thiết lập mã PIN');
      console.error(error);
    },
  });

  // Verify PIN code
  const verifyPinCode = useCallback(async (pin: string): Promise<boolean> => {
    if (!settings?.pin_hash) return true; // No PIN set

    const pinHash = btoa(pin);
    return pinHash === settings.pin_hash;
  }, [settings?.pin_hash]);

  // Toggle biometric
  const toggleBiometric = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if biometric is supported
      if (enabled && !window.PublicKeyCredential) {
        throw new Error('Thiết bị không hỗ trợ xác thực sinh trắc học');
      }

      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: user.id,
          biometric_credential_id: enabled ? 'enabled' : null,
        });

      if (error) throw error;
      return enabled;
    },
    onSuccess: (enabled) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-security-settings'] });
      toast.success(enabled ? 'Đã kích hoạt sinh trắc học' : 'Đã tắt sinh trắc học');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật cài đặt sinh trắc học');
    },
  });

  // Check if security verification is required for withdrawal
  const requiresSecurityCheck = useCallback((): boolean => {
    if (!settings) return false;
    return settings.is_2fa_enabled || !!settings.pin_hash || !!settings.biometric_credential_id;
  }, [settings]);

  return {
    settings,
    isLoading,
    isPinModalOpen,
    setIsPinModalOpen,
    isVerifying,
    setIsVerifying,
    
    // Mutations
    toggle2FA: toggle2FA.mutate,
    is2FAToggling: toggle2FA.isPending,
    
    setPinCode: setPinCode.mutate,
    isPinSetting: setPinCode.isPending,
    
    verifyPinCode,
    
    toggleBiometric: toggleBiometric.mutate,
    isBiometricToggling: toggleBiometric.isPending,
    
    requiresSecurityCheck,
    
    // Computed
    has2FA: settings?.is_2fa_enabled ?? false,
    hasPin: !!settings?.pin_hash,
    hasBiometric: !!settings?.biometric_credential_id,
  };
}
