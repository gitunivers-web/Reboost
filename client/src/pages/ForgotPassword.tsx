import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import { useLanguage, useTranslations } from '@/lib/i18n';
import { translateBackendMessage } from '@/lib/translateBackendMessage';

export default function ForgotPassword() {
  const t = useTranslations();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/auth/forgot-password', { email });
      return await response.json();
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: t.forgotPassword.emailSent,
        description: t.forgotPassword.emailSentDesc,
      });
    },
    onError: (error: any) => {
      toast({
        title: t.forgotPassword.error,
        description: translateBackendMessage(error.message, language) || t.forgotPassword.errorDesc,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      forgotPasswordMutation.mutate(email);
    }
  };

  if (emailSent) {
    return (
      <>
        <SEO 
          title={t.seo.forgotPassword.emailSentTitle}
          description={t.seo.forgotPassword.emailSentDescription}
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>{t.forgotPassword.emailSent}</CardTitle>
              <CardDescription>
                {t.forgotPassword.emailSentDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation('/auth')}
                variant="outline"
                className="w-full"
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.forgotPassword.backToLogin}
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={t.seo.forgotPassword.title}
        description={t.seo.forgotPassword.description}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-6 w-6 text-primary" />
              <CardTitle>{t.forgotPassword.title}</CardTitle>
            </div>
            <CardDescription>
              {t.forgotPassword.instructions}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.forgotPassword.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.forgotPassword.emailPlaceholder}
                  required
                  autoFocus
                  data-testid="input-email"
                />
              </div>

              <Button
                type="submit"
                disabled={!email || forgotPasswordMutation.isPending}
                className="w-full"
                data-testid="button-send-reset-link"
              >
                {forgotPasswordMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {forgotPasswordMutation.isPending ? t.forgotPassword.sending : t.forgotPassword.sendResetLink}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/auth')}
                className="w-full"
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.forgotPassword.backToLogin}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
