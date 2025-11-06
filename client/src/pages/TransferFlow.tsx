import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ArrowLeft, CheckCircle2, Clock, Send, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TransferDetailsResponse, ExternalAccount } from '@shared/schema';

export default function TransferFlow() {
  const [, params] = useRoute('/transfer/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'form' | 'verification' | 'validation' | 'progress' | 'complete'>('form');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [externalAccountId, setExternalAccountId] = useState('');
  const [validationCode, setValidationCode] = useState('');
  const [transferId, setTransferId] = useState(params?.id || '');
  const [currentSequence, setCurrentSequence] = useState(1);
  const [demoCode, setDemoCode] = useState('');
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const verificationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: externalAccounts } = useQuery<ExternalAccount[]>({
    queryKey: ['/api/external-accounts'],
  });

  const { data: transferData, refetch: refetchTransfer } = useQuery<TransferDetailsResponse>({
    queryKey: [`/api/transfers/${transferId}`],
    enabled: !!transferId,
    refetchInterval: step === 'progress' ? 2000 : false,
  });

  const initiateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/transfers/initiate', data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      
      setTransferId(data.transfer.id);
      setDemoCode(data.codeForDemo);
      setCurrentSequence(1);
      setVerificationProgress(0);
      setLocation(`/transfer/${data.transfer.id}`);
      setStep('verification');
      toast({
        title: 'Transfert initié',
        description: 'Vérification de votre transfert en cours...',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec de l\'initiation du transfert',
      });
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (data: { code: string; sequence: number }) => {
      const response = await apiRequest('POST', `/api/transfers/${transferId}/validate-code`, data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      setValidationCode('');
      toast({
        title: 'Code validé',
        description: data.message,
      });
      
      if (data.isComplete) {
        setStep('progress');
      } else {
        setCurrentSequence(prev => prev + 1);
        sendCodeMutation.mutate({ method: 'email' });
      }
      
      refetchTransfer();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Code invalide',
        description: 'Le code est incorrect ou expiré',
      });
    },
  });

  const sendCodeMutation = useMutation({
    mutationFn: async (data: { method: string }) => {
      const response = await apiRequest('POST', `/api/transfers/${transferId}/send-code`, data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      setDemoCode(data.codeForDemo);
      toast({
        title: 'Code envoyé',
        description: `Code ${data.sequence} envoyé avec succès`,
      });
    },
  });

  useEffect(() => {
    if (step === 'verification') {
      let progress = 0;
      
      verificationIntervalRef.current = setInterval(() => {
        progress += 100 / 45;
        setVerificationProgress(Math.min(progress, 100));
        
        if (progress >= 100) {
          if (verificationIntervalRef.current) {
            clearInterval(verificationIntervalRef.current);
            verificationIntervalRef.current = null;
          }
          setStep('validation');
        }
      }, 1000);
      
      notificationTimeoutRef.current = setTimeout(() => {
        toast({
          title: 'Transfert approuvé',
          description: 'Votre transfert est approuvé et en cours de traitement.',
        });
      }, 20000);
      
      return () => {
        if (verificationIntervalRef.current) {
          clearInterval(verificationIntervalRef.current);
          verificationIntervalRef.current = null;
        }
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
          notificationTimeoutRef.current = null;
        }
      };
    }
  }, [step, toast]);

  useEffect(() => {
    if (transferData?.transfer) {
      const transfer = transferData.transfer;
      
      if (transfer.status === 'completed') {
        setStep('complete');
      } else if (transfer.status === 'in-progress' && transfer.codesValidated === transfer.requiredCodes) {
        setStep('progress');
      } else if (transfer.status === 'pending' || transfer.codesValidated < transfer.requiredCodes) {
        if (step === 'form') {
          setStep('validation');
          setCurrentSequence(transfer.codesValidated + 1);
        }
      }
    }
  }, [transferData, step]);

  const handleInitiate = () => {
    if (!amount || !recipient) {
      toast({
        variant: 'destructive',
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs',
      });
      return;
    }

    initiateMutation.mutate({
      amount: parseFloat(amount),
      recipient,
      externalAccountId: externalAccountId && externalAccountId !== 'none' ? externalAccountId : null,
    });
  };

  const handleValidateCode = () => {
    if (!validationCode || validationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Code invalide',
        description: 'Le code doit contenir 6 chiffres',
      });
      return;
    }

    validateMutation.mutate({
      code: validationCode,
      sequence: currentSequence,
    });
  };

  if (step === 'form') {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/dashboard')}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <Card data-testid="card-transfer-form">
          <CardHeader>
            <CardTitle>Nouveau transfert</CardTitle>
            <CardDescription>
              Initiez un transfert sécurisé vers un compte externe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (EUR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Compte externe (optionnel)</Label>
              <Select value={externalAccountId} onValueChange={setExternalAccountId}>
                <SelectTrigger data-testid="select-account">
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun compte enregistré</SelectItem>
                  {externalAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountLabel} - {account.iban}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Bénéficiaire</Label>
              <Input
                id="recipient"
                placeholder="Nom du bénéficiaire"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                data-testid="input-recipient"
              />
            </div>

            <Button 
              onClick={handleInitiate}
              disabled={initiateMutation.isPending}
              className="w-full"
              data-testid="button-initiate"
            >
              {initiateMutation.isPending ? 'Initiation...' : 'Initier le transfert'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <Card data-testid="card-verification" className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                <div className="absolute inset-0 bg-blue-400 dark:bg-blue-600 rounded-full opacity-25 animate-ping"></div>
              </div>
              Vérification du transfert
            </CardTitle>
            <CardDescription>
              Veuillez patienter pendant la vérification de votre transfert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" data-testid="alert-verification">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <strong className="text-lg">⚠️ Ne fermez pas cette page</strong>
                <p className="mt-2">
                  Votre transfert est en cours de vérification par notre système sécurisé. 
                  Cette opération prend environ 45 secondes.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Progression de la vérification</span>
                <span className="text-blue-600 dark:text-blue-400" data-testid="text-verification-progress">
                  {Math.round(verificationProgress)}%
                </span>
              </div>
              <Progress 
                value={verificationProgress} 
                className="h-4 bg-gray-200 dark:bg-gray-700"
              />
              <p className="text-sm text-muted-foreground text-center">
                Vérification des informations bancaires et des limites de transfert...
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Étapes de vérification</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-none">
                    <li className={verificationProgress > 20 ? "text-green-600 dark:text-green-400" : ""}>
                      ✓ Vérification du compte émetteur
                    </li>
                    <li className={verificationProgress > 40 ? "text-green-600 dark:text-green-400" : ""}>
                      ✓ Validation du montant et des frais
                    </li>
                    <li className={verificationProgress > 60 ? "text-green-600 dark:text-green-400" : ""}>
                      ✓ Contrôle de sécurité anti-fraude
                    </li>
                    <li className={verificationProgress > 80 ? "text-green-600 dark:text-green-400" : ""}>
                      ✓ Préparation du transfert sécurisé
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'validation') {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <Card data-testid="card-validation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Validation du transfert
            </CardTitle>
            <CardDescription>
              Code {currentSequence} / {transferData?.transfer?.requiredCodes || 1}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert data-testid="alert-demo-code">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Code de démonstration :</strong> {demoCode}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="code">Code de validation (6 chiffres)</Label>
              <Input
                id="code"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={validationCode}
                onChange={(e) => setValidationCode(e.target.value.replace(/\D/g, ''))}
                data-testid="input-validation-code"
              />
              <p className="text-sm text-muted-foreground">
                Un code a été envoyé à votre email
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleValidateCode}
                disabled={validateMutation.isPending}
                className="flex-1"
                data-testid="button-validate-code"
              >
                {validateMutation.isPending ? 'Validation...' : 'Valider'}
              </Button>
              <Button
                variant="outline"
                onClick={() => sendCodeMutation.mutate({ method: 'email' })}
                disabled={sendCodeMutation.isPending}
                data-testid="button-resend-code"
              >
                <Send className="w-4 h-4 mr-2" />
                Renvoyer
              </Button>
            </div>

            {transferData?.events && (
              <div className="mt-6 space-y-2">
                <h3 className="font-semibold text-sm">Historique</h3>
                <div className="space-y-2" data-testid="list-events">
                  {transferData.events.map((event: any) => (
                    <div key={event.id} className="text-sm border-l-2 border-primary pl-3 py-1">
                      <p className="font-medium">{event.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'progress') {
    const progress = transferData?.transfer?.progressPercent || 0;
    const status = transferData?.transfer?.status || 'in-progress';
    const isPaused = transferData?.transfer?.isPaused || false;
    const pausePercent = transferData?.transfer?.pausePercent;

    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <Card data-testid="card-progress">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isPaused ? (
                <>
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                  Transfert en pause
                </>
              ) : (
                <>
                  <Clock className="w-6 h-6 text-primary animate-pulse" />
                  Transfert en cours
                </>
              )}
            </CardTitle>
            <CardDescription>
              Montant: {transferData?.transfer?.amount} EUR vers {transferData?.transfer?.recipient}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span className="font-semibold" data-testid="text-progress">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {isPaused ? (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                      Code de déblocage requis à {pausePercent}%
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      Veuillez contacter le service client pour obtenir le code de déblocage de votre transfert.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="pause-code" className="text-sm font-medium">
                    Code de déblocage
                  </label>
                  <Input
                    id="pause-code"
                    type="text"
                    value={validationCode}
                    onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
                    placeholder="Entrez le code"
                    className="font-mono"
                    data-testid="input-pause-code"
                  />
                </div>

                <Button
                  onClick={() => {
                    if (!validationCode) {
                      toast({
                        variant: 'destructive',
                        title: 'Code requis',
                        description: 'Veuillez entrer le code de déblocage',
                      });
                      return;
                    }
                    
                    apiRequest('POST', `/api/transfers/${transferId}/validate-pause-code`, { code: validationCode })
                      .then(async (response) => {
                        const data = await response.json();
                        setValidationCode('');
                        toast({
                          title: 'Transfert débloqué',
                          description: data.message,
                        });
                        refetchTransfer();
                      })
                      .catch(() => {
                        toast({
                          variant: 'destructive',
                          title: 'Code invalide',
                          description: 'Le code est incorrect ou expiré',
                        });
                      });
                  }}
                  disabled={!validationCode}
                  className="w-full"
                  data-testid="button-validate-pause-code"
                >
                  Valider le code
                </Button>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">État actuel</p>
                <p className="text-sm text-muted-foreground" data-testid="text-status">
                  {status === 'completed' 
                    ? 'Transfert terminé !' 
                    : 'Traitement en cours par notre système bancaire...'}
                </p>
              </div>
            )}

            {transferData?.events && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Événements</h3>
                <div className="space-y-2" data-testid="list-progress-events">
                  {transferData.events.map((event: any) => (
                    <div key={event.id} className="text-sm border-l-2 border-primary pl-3 py-1">
                      <p className="font-medium">{event.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <Card data-testid="card-complete">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Transfert complété
            </CardTitle>
            <CardDescription>
              Votre transfert a été effectué avec succès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Montant</span>
                <span className="text-sm font-semibold">{transferData?.transfer?.amount} EUR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Bénéficiaire</span>
                <span className="text-sm">{transferData?.transfer?.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Frais</span>
                <span className="text-sm">{transferData?.transfer?.feeAmount} EUR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Date</span>
                <span className="text-sm">
                  {transferData?.transfer?.completedAt 
                    ? new Date(transferData.transfer.completedAt).toLocaleString('fr-FR')
                    : 'N/A'
                  }
                </span>
              </div>
            </div>

            <Button
              onClick={() => setLocation('/dashboard')}
              className="w-full"
              data-testid="button-back-to-dashboard"
            >
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
