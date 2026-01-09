import { useState, useEffect } from "react";
import { Gift, Copy, Share2, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReferralShareCardProps {
  userId: string | null;
}

// Hàm chuyển đổi tên thành username format
const generateUsernameFromName = (fullName: string): string => {
  if (!fullName) return "";
  
  // Bỏ dấu tiếng Việt
  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };
  
  const normalized = removeVietnameseTones(fullName);
  
  // Tách từng từ và viết hoa chữ cái đầu, nối bằng dấu chấm
  const words = normalized
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  
  return words.join(".");
};

export function ReferralShareCard({ userId }: ReferralShareCardProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [usesCount, setUsesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchOrCreateReferralCode();
    }
  }, [userId]);

  const generateUniqueUsernameCode = async (baseName: string): Promise<string> => {
    let code = baseName;
    let counter = 0;
    
    while (true) {
      const testCode = counter === 0 ? code : `${code}${counter}`;
      
      // Kiểm tra xem code đã tồn tại chưa
      const { data: existing } = await supabase
        .from("referral_codes")
        .select("id")
        .ilike("code", testCode)
        .maybeSingle();
      
      if (!existing) {
        return testCode;
      }
      
      counter++;
    }
  };

  const fetchOrCreateReferralCode = async () => {
    try {
      // Thử lấy code hiện có
      const { data, error } = await supabase
        .from("referral_codes")
        .select("code, uses_count")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setReferralCode(data.code);
        setUsesCount(data.uses_count);
      } else {
        // Lấy tên người dùng từ profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", userId)
          .single();
        
        const fullName = profile?.full_name || "User";
        const baseName = generateUsernameFromName(fullName);
        
        // Tạo code unique từ tên
        const newCode = await generateUniqueUsernameCode(baseName);
        
        const { data: insertedData, error: insertError } = await supabase
          .from("referral_codes")
          .insert({ user_id: userId, code: newCode })
          .select("code, uses_count")
          .single();

        if (insertError) throw insertError;
        
        if (insertedData) {
          setReferralCode(insertedData.code);
          setUsesCount(insertedData.uses_count);
        }
      }
    } catch (error) {
      console.error("Error fetching/creating referral code:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/r/${referralCode}`;
  };

  const handleCopy = async () => {
    if (!referralCode) return;
    
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      toast({
        title: "Đã sao chép!",
        description: "Link giới thiệu đã được sao chép vào clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép link",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!referralCode) return;

    const shareData = {
      title: "Tham gia FUN Charity cùng tôi!",
      text: "Hãy tham gia FUN Charity - nền tảng từ thiện minh bạch. Đăng ký qua link này để nhận thưởng!",
      url: getReferralLink(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        handleCopy();
      }
    }
  };

  if (loading) {
    return (
      <Card className="glass-card animate-pulse">
        <CardContent className="p-4">
          <div className="h-20 bg-muted/50 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!referralCode) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-violet-600/20 backdrop-blur-xl shadow-xl shadow-purple-500/10">
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-violet-500/30">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 shadow-lg shadow-orange-400/30">
            <Gift className="w-4 h-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-violet-300 bg-clip-text text-transparent font-bold">
            Mời bạn bè - Nhận thưởng ✨
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-purple-200/90">
          Chia sẻ link giới thiệu để nhận{" "}
          <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent font-bold">
            30.000 Camly 💎
          </span>{" "}
          cho mỗi người đăng ký!
        </p>

        {/* Stats */}
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-600/30 via-violet-500/20 to-pink-600/30 rounded-xl border border-purple-400/20 shadow-inner">
          <div className="p-1.5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm">
            <span className="font-bold text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">{usesCount}</span>
            <span className="text-purple-200/80"> người đã đăng ký qua link của bạn 🎉</span>
          </span>
        </div>

        {/* Referral Link Preview */}
        <div className="p-3 bg-gradient-to-r from-purple-900/40 to-violet-900/40 rounded-xl border border-purple-400/30 shadow-inner">
          <p className="text-xs text-purple-300/90 truncate font-mono">
            {getReferralLink()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2 border-purple-400/30 bg-purple-500/20 hover:bg-purple-500/40 text-purple-100 hover:text-white transition-all duration-300"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-300">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Sao chép link
              </>
            )}
          </Button>
          <Button 
            className="flex-1 gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 hover:from-purple-600 hover:via-pink-600 hover:to-violet-600 text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-pink-500/40 hover:scale-[1.02]"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ ✨
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
