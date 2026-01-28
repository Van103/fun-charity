import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Shield, 
  Key, 
  Fingerprint, 
  Check,
  Loader2,
  ChevronRight,
  Lock
} from "lucide-react";
import { useWalletSecurity } from "@/hooks/useWalletSecurity";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function WalletSecuritySettings() {
  const {
    isLoading,
    has2FA,
    hasPin,
    hasBiometric,
    toggle2FA,
    is2FAToggling,
    setPinCode,
    isPinSetting,
    toggleBiometric,
    isBiometricToggling,
  } = useWalletSecurity();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [confirmPinValue, setConfirmPinValue] = useState("");
  const [pinStep, setPinStep] = useState<"enter" | "confirm">("enter");

  const handleSetPin = () => {
    if (pinStep === "enter") {
      if (pinValue.length === 6) {
        setPinStep("confirm");
      }
    } else {
      if (pinValue === confirmPinValue) {
        setPinCode(pinValue);
        setPinValue("");
        setConfirmPinValue("");
        setPinStep("enter");
        setIsPinModalOpen(false);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Bảo mật Ví
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Key className="w-4 h-4 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Xác thực 2 bước (2FA)</Label>
                <p className="text-xs text-muted-foreground">Yêu cầu mã OTP khi rút tiền</p>
              </div>
            </div>
            <Switch
              checked={has2FA}
              onCheckedChange={toggle2FA}
              disabled={is2FAToggling}
            />
          </div>

          {/* PIN Setup */}
          <div 
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => setIsPinModalOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Mã PIN giao dịch</Label>
                <p className="text-xs text-muted-foreground">Mã PIN 6 chữ số để xác nhận giao dịch</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasPin ? (
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  <Check className="w-3 h-3 mr-1" />
                  Đã thiết lập
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">Thiết lập</span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Biometric */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Fingerprint className="w-4 h-4 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Xác thực sinh trắc học</Label>
                <p className="text-xs text-muted-foreground">Face ID / Touch ID / Windows Hello</p>
              </div>
            </div>
            <Switch
              checked={hasBiometric}
              onCheckedChange={toggleBiometric}
              disabled={isBiometricToggling}
            />
          </div>

          {/* Security Status */}
          <div className="mt-4 p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium">Trạng thái bảo mật:</span>
              {(has2FA || hasPin || hasBiometric) ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  Đã bảo vệ
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                  Chưa bảo vệ
                </Badge>
              )}
            </div>
            {!(has2FA || hasPin || hasBiometric) && (
              <p className="text-xs text-muted-foreground mt-2">
                Bật ít nhất một phương thức bảo mật để bảo vệ ví của bạn
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PIN Setup Modal */}
      <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              {hasPin ? "Đổi mã PIN" : "Thiết lập mã PIN"}
            </DialogTitle>
            <DialogDescription>
              {pinStep === "enter" 
                ? "Nhập mã PIN 6 chữ số để bảo vệ giao dịch"
                : "Nhập lại mã PIN để xác nhận"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={pinStep}
                initial={{ opacity: 0, x: pinStep === "enter" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: pinStep === "enter" ? 20 : -20 }}
                className="flex flex-col items-center gap-4"
              >
                <InputOTP
                  maxLength={6}
                  value={pinStep === "enter" ? pinValue : confirmPinValue}
                  onChange={pinStep === "enter" ? setPinValue : setConfirmPinValue}
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

                {pinStep === "confirm" && pinValue !== confirmPinValue && confirmPinValue.length === 6 && (
                  <p className="text-sm text-destructive">Mã PIN không khớp</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-2">
            {pinStep === "confirm" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setPinStep("enter");
                  setConfirmPinValue("");
                }}
                className="flex-1"
              >
                Quay lại
              </Button>
            )}
            <Button 
              onClick={handleSetPin}
              disabled={
                isPinSetting || 
                (pinStep === "enter" && pinValue.length < 6) ||
                (pinStep === "confirm" && (confirmPinValue.length < 6 || pinValue !== confirmPinValue))
              }
              className="flex-1"
            >
              {isPinSetting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : pinStep === "enter" ? (
                "Tiếp tục"
              ) : (
                "Xác nhận"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}
