import { useState, useRef, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useLanguage, useTranslations } from "@/lib/i18n";
import { translateBackendMessage } from "@/lib/translateBackendMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function VerifyOtp() {
  const { language } = useLanguage();
  const t = useTranslations();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/verify-otp/:userId");
  const userId = params?.userId || "";
  const queryClient = useQueryClient();

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: t.common.error,
        description: t.auth.sessionExpiredMessage,
      });
      navigate("/auth");
    }
  }, [userId, navigate, t, toast]);

  const verifyMutation = useMutation({
    mutationFn: async (otpCode: string) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", { userId, code: otpCode });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t.common.success,
        description: t.auth.loginSuccess,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t.common.error,
        description: translateBackendMessage(error.message, language) || t.auth.invalidOtp,
      });
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== "")) {
      const otpCode = newCode.join("");
      verifyMutation.mutate(otpCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setCode(digits);
    inputRefs.current[5]?.focus();

    verifyMutation.mutate(pastedData);
  };

  const handleBack = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t.auth.twoFactorAuth}
          </CardTitle>
          <CardDescription className="text-base">
            {t.auth.enterOtpCode}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={verifyMutation.isPending}
                data-testid={`input-otp-${index}`}
                className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {verifyMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.auth.verificationInProgress}...</span>
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.auth.otpExpiresIn}
            </p>
            
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={verifyMutation.isPending}
              className="w-full"
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.auth.backToLogin}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
