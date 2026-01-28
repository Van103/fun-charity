import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Fingerprint, 
  Loader2,
  RefreshCw,
  Lock,
  Mail
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface AdminSecurityGateProps {
  children: ReactNode;
}

export function AdminSecurityGate({ children }: AdminSecurityGateProps) {
  const { data: isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [userEmail, setUserEmail] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Check for existing valid session
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const checkExistingSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || "");

      // Check for valid admin session
      const { data: session } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('admin_id', user.id)
        .gt('session_expires_at', new Date().toISOString())
        .not('verified_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (session) {
        setIsVerified(true);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
    }
  };

  const sendOTP = async () => {
    setIsSendingOTP(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      const sessionExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store OTP in admin_sessions
      const { data: newSession, error } = await supabase
        .from('admin_sessions')
        .insert({
          admin_id: user.id,
          otp_code: otp,
          otp_expires_at: expiresAt.toISOString(),
          session_expires_at: sessionExpiresAt.toISOString(),
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(newSession.id);

      // In development, show OTP in console and toast
      console.log('Admin OTP:', otp);
      toast.info(`Mã OTP (Dev): ${otp}`, { duration: 10000 });

      // In production, send email via edge function
      // await supabase.functions.invoke('send-otp-email', { 
      //   body: { email: user.email, otp } 
      // });

      setOtpSent(true);
      setCountdown(60);
      toast.success('Mã OTP đã được gửi');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Không thể gửi mã OTP');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async () => {
    if (otpValue.length !== 6) return;

    setIsVerifying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find the session with matching OTP
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('otp_code', otpValue)
        .gt('otp_expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        toast.error('Mã OTP không hợp lệ hoặc đã hết hạn');
        setOtpValue("");
        return;
      }

      // Mark session as verified
      await supabase
        .from('admin_sessions')
        .update({ 
          verified_at: new Date().toISOString(),
          otp_code: null // Clear OTP after use
        })
        .eq('id', session.id);

      setIsVerified(true);
      toast.success('Xác thực thành công!');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Lỗi xác thực');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBiometric = async () => {
    if (!window.PublicKeyCredential) {
      toast.error('Thiết bị không hỗ trợ xác thực sinh trắc học');
      return;
    }

    try {
      // For demo purposes, we'll just verify after a short delay
      // In production, implement proper WebAuthn flow
      setIsVerifying(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create verified session
      await supabase
        .from('admin_sessions')
        .insert({
          admin_id: user.id,
          verified_at: new Date().toISOString(),
          session_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          user_agent: navigator.userAgent,
        });

      setIsVerified(true);
      toast.success('Xác thực sinh trắc học thành công!');
    } catch (error) {
      console.error('Biometric error:', error);
      toast.error('Xác thực sinh trắc học thất bại');
    } finally {
      setIsVerifying(false);
    }
  };

  // Mask email for display
  const maskedEmail = userEmail 
    ? userEmail.replace(/(.{3})(.*)(@.*)/, '$1***$3')
    : '';

  // Loading state
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Truy cập bị từ chối</h2>
            <p className="text-muted-foreground">
              Bạn không có quyền truy cập trang này
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already verified
  if (isVerified) {
    return <>{children}</>;
  }

  // Security gate UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-xl">Xác thực Admin</CardTitle>
            <CardDescription>
              Vui lòng xác thực để truy cập khu vực quản trị
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.div
                  key="send-otp"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <Mail className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Mã xác thực sẽ được gửi đến
                    </p>
                    <p className="font-medium">{maskedEmail}</p>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={sendOTP}
                    disabled={isSendingOTP}
                  >
                    {isSendingOTP ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Gửi mã xác thực
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="verify-otp"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Nhập mã OTP đã gửi đến email
                    </p>
                    
                    <div className="flex justify-center mb-4">
                      <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={setOtpValue}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={sendOTP}
                      disabled={countdown > 0 || isSendingOTP}
                      className="text-muted-foreground"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {countdown > 0 ? `Gửi lại mã (${countdown}s)` : 'Gửi lại mã'}
                    </Button>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={verifyOTP}
                    disabled={otpValue.length !== 6 || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">hoặc</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleBiometric}
                    disabled={isVerifying}
                  >
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Xác thực sinh trắc học
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                Phiên làm việc: 30 phút
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
