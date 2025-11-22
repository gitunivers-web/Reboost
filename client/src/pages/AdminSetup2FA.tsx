import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest, clearCsrfToken } from '@/lib/queryClient';
import { Loader2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminSetup2FA() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');
  
  const userId = new URLSearchParams(window.location.search).get('userId') || '';
  const email = new URLSearchParams(window.location.search).get('email') || '';

  useEffect(() => {
    if (!userId) {
      toast({
        title: 'Erreur',
        description: 'Session expirée. Veuillez vous reconnecter.',
        variant: 'destructive',
      });
      setLocation('/auth');
    }
  }, [userId, setLocation, toast]);

  // Récupérer le QR code et le secret
  const { data: setupData, isLoading: isLoadingSetup } = useQuery({
    queryKey: ['/api/admin/2fa/setup-initial', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/admin/2fa/setup-initial', { userId });
      return await response.json();
    },
  });

  useEffect(() => {
    if (setupData?.secret) {
      setSecret(setupData.secret);
    }
  }, [setupData]);

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/admin/2fa/verify-initial', {
        userId,
        token,
        secret,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      clearCsrfToken();
      toast({
        title: 'Succès',
        description: '2FA configuré avec succès. Connexion en cours...',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setLocation('/admin');
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Code invalide. Veuillez réessayer.',
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

  if (!userId) {
    return null;
  }

  return (
    <>
      <SEO 
        title="Configuration 2FA Admin | Altus Finances Group"
        description="Configuration de l'authentification à deux facteurs pour les administrateurs"
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Configuration 2FA Administrateur</CardTitle>
                <CardDescription className="mt-1">
                  Sécurité obligatoire pour tous les administrateurs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                L'authentification à deux facteurs (2FA) est <strong>obligatoire</strong> pour tous les comptes administrateurs afin de protéger les données sensibles.
              </AlertDescription>
            </Alert>

            {isLoadingSetup ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Étape 1 : Scanner le QR Code */}
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Téléchargez Google Authenticator</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Installez l'application Google Authenticator sur votre smartphone :
                      </p>
                      <div className="flex gap-3 mt-2">
                        <a
                          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Android (Play Store)
                        </a>
                        <span className="text-muted-foreground">•</span>
                        <a
                          href="https://apps.apple.com/app/google-authenticator/id388497605"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          iOS (App Store)
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-3">Scannez le code QR</h3>
                      {setupData?.qrCode ? (
                        <div className="bg-white p-6 rounded-lg inline-block border-2 border-gray-200">
                          <img 
                            src={setupData.qrCode} 
                            alt="QR Code pour 2FA" 
                            className="w-48 h-48"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
                        </div>
                      )}
                      
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Code de secours (si le QR ne fonctionne pas) :</p>
                        <code className="text-sm font-mono break-all">{secret || '...'}</code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-3">Entrez le code généré</h3>
                      <form onSubmit={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Code de vérification (6 chiffres)</Label>
                          <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="text-center text-2xl tracking-widest font-mono"
                            autoFocus
                            data-testid="input-2fa-setup-code"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={verificationCode.length !== 6 || verifyMutation.isPending || !secret}
                          className="w-full"
                          data-testid="button-activate-2fa"
                        >
                          {verifyMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Activation en cours...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Activer le 2FA et se connecter
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/auth')}
                className="w-full"
                data-testid="button-back-to-login"
              >
                Retour à la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
