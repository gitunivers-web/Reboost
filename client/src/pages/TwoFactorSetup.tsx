import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Loader2, Shield, KeyRound, Smartphone } from 'lucide-react';
import SEO from '@/components/SEO';

export default function TwoFactorSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');

  const { data: setupData, isLoading: isLoadingSetup } = useQuery({
    queryKey: ['/api/2fa/setup'],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/2fa/setup');
      const data = await response.json();
      setSecret(data.secret);
      return data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/2fa/verify', { token, secret });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Authentification à deux facteurs activée avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setLocation('/settings');
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Code invalide',
        variant: 'destructive',
      });
    },
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      verifyMutation.mutate(verificationCode);
    }
  };

  if (isLoadingSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Configuration 2FA | Altus Finance Group"
        description="Configurez l'authentification à deux facteurs pour sécuriser votre compte"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Configurer l'authentification à deux facteurs</CardTitle>
            </div>
            <CardDescription>
              Renforcez la sécurité de votre compte avec Google Authenticator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    Étape 1 : Installez Google Authenticator
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Téléchargez l'application sur votre smartphone (iOS ou Android)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <KeyRound className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <p className="font-medium text-sm text-purple-900 dark:text-purple-100">
                    Étape 2 : Scannez le QR code
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                    Ouvrez Google Authenticator et scannez ce QR code
                  </p>
                  {setupData?.qrCode && (
                    <div className="flex justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <img 
                        src={setupData.qrCode} 
                        alt="QR Code 2FA" 
                        className="w-64 h-64"
                        data-testid="img-qrcode"
                      />
                    </div>
                  )}
                  <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded border">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Ou entrez cette clé manuellement :
                    </p>
                    <code className="text-sm font-mono break-all text-gray-900 dark:text-gray-100" data-testid="text-secret">
                      {secret}
                    </code>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <p className="font-medium text-sm text-green-900 dark:text-green-100">
                      Étape 3 : Vérifiez avec le code
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Entrez le code à 6 chiffres affiché dans l'application
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="code">Code de vérification</Label>
                      <Input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="text-center text-2xl tracking-widest font-mono"
                        data-testid="input-verification-code"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/settings')}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                    className="flex-1"
                    data-testid="button-activate-2fa"
                  >
                    {verifyMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Activer la vérification en deux étapes
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
