import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest, clearCsrfToken } from '@/lib/queryClient';
import { Loader2, Shield } from 'lucide-react';
import SEO from '@/components/SEO';
import { useLanguage, useTranslations } from '@/lib/i18n';
import { translateBackendMessage } from '@/lib/translateBackendMessage';

export default function VerifyTwoFactor() {
  const t = useTranslations();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  
  const storedUserId = new URLSearchParams(window.location.search).get('userId') || '';

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/2fa/validate', { 
        userId: storedUserId, 
        token 
      });
      return await response.json();
    },
    onSuccess: (data) => {
      clearCsrfToken();
      toast({
        title: t.twoFactorAuth.login.successTitle,
        description: t.twoFactorAuth.login.successMessage,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: t.twoFactorAuth.login.errorTitle,
        description: translateBackendMessage(error.message, language) || t.twoFactorAuth.login.errorMessage,
        variant: 'destructive',
      });
      setVerificationCode('');
    },
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      verifyMutation.mutate(verificationCode);
    }
  };

  if (!storedUserId) {
    setLocation('/auth');
    return null;
  }

  return (
    <>
      <SEO 
        title={t.seo.verifyTwoFactor.title}
        description={t.seo.verifyTwoFactor.description}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>{t.twoFactorAuth.login.title}</CardTitle>
            </div>
            <CardDescription>
              {t.twoFactorAuth.login.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t.twoFactorAuth.login.enterCode}</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.twoFactorAuth.login.codePlaceholder}
                  className="text-center text-2xl tracking-widest font-mono placeholder:text-muted-foreground/60"
                  autoFocus
                  data-testid="input-2fa-code"
                />
              </div>

              <Button
                type="submit"
                disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                className="w-full"
                data-testid="button-verify-2fa"
              >
                {verifyMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t.twoFactorAuth.login.verify}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/auth')}
                className="w-full"
                data-testid="button-back"
              >
                {t.twoFactorAuth.login.backToLogin}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
