import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseKycDocumentAccessResult {
  getSecureDocumentUrl: (documentPath: string, kycRequestId?: string) => Promise<string | null>;
  isLoading: boolean;
}

/**
 * Hook for securely accessing KYC documents with signed URLs.
 * This ensures all admin document access is audited and URLs are time-limited.
 */
export function useKycDocumentAccess(): UseKycDocumentAccessResult {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getSecureDocumentUrl = useCallback(async (
    documentPath: string, 
    kycRequestId?: string
  ): Promise<string | null> => {
    if (!documentPath) return null;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng đăng nhập để xem tài liệu',
          variant: 'destructive',
        });
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kyc-document-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ documentPath, kycRequestId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 403) {
          toast({
            title: 'Không có quyền',
            description: 'Chỉ admin mới có thể xem tài liệu KYC',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Lỗi',
            description: errorData.error || 'Không thể tải tài liệu',
            variant: 'destructive',
          });
        }
        return null;
      }

      const { signedUrl } = await response.json();
      return signedUrl;
    } catch (error) {
      console.error('Error getting secure document URL:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải tài liệu',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { getSecureDocumentUrl, isLoading };
}
