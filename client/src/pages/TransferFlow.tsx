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
import { ArrowLeft, CheckCircle2, Clock, Send, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TransferDetailsResponse, ExternalAccount, TransferValidationCode } from '@shared/schema';
import { useTranslations } from '@/lib/i18n';

export default function TransferFlow() {
  const [, params] = useRoute('/transfer/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const t = useTranslations();
  
  const [step, setStep] = useState<'form' | 'verification' | 'progress' | 'complete'>('form');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [externalAccountId, setExternalAccountId] = useState('');
  const [loanId, setLoanId] = useState('');
  const [validationCode, setValidationCode] = useState('');
  const [transferId, setTransferId] = useState(params?.id || '');
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const [simulatedProgress, setSimulatedProgress] = useState(10);
  const [isPausedForCode, setIsPausedForCode] = useState(false);
  const [currentCodeSequence, setCurrentCodeSequence] = useState(1);
  const [lastValidatedSequence, setLastValidatedSequence] = useState(0);
  
  const verificationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: externalAccounts } = useQuery<ExternalAccount[]>({
    queryKey: ['/api/external-accounts'],
  });

  const { data: activeLoans } = useQuery<any[]>({
    queryKey: ['/api/loans'],
    select: (loans) => loans.filter(loan => loan.status === 'active' && loan.contractStatus === 'completed'),
  });

  const { data: transferData, refetch: refetchTransfer } = useQuery<TransferDetailsResponse>({
    queryKey: [`/api/transfers/${transferId}`],
    enabled: !!transferId,
    refetchInterval: step === 'progress' ? 3000 : false,
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
      setCurrentCodeSequence(1);
      setVerificationProgress(0);
      setSimulatedProgress(10);
      setIsPausedForCode(false);
      setLocation(`/transfer/${data.transfer.id}`);
      setStep('verification');
      toast({
        title: t.transferFlow.toast.initiated,
        description: t.transferFlow.toast.initiatedDesc,
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: t.transferFlow.toast.error,
        description: t.transferFlow.toast.errorInitiation,
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
      const contextInfo = data.codeContext ? ` - ${data.codeContext}` : '';
      
      toast({
        title: t.transferFlow.toast.codeValidated,
        description: `${data.message}${contextInfo}`,
      });
      
      setLastValidatedSequence(currentCodeSequence);
      setIsPausedForCode(false);
      setCurrentCodeSequence(prev => prev + 1);
      
      refetchTransfer();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: t.transferFlow.toast.codeInvalid,
        description: t.transferFlow.toast.codeInvalidDesc,
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
          setStep('progress');
        }
      }, 1000);
      
      notificationTimeoutRef.current = setTimeout(() => {
        toast({
          title: t.transferFlow.toast.approved,
          description: t.transferFlow.toast.approvedDesc,
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
    if (step === 'progress' && transferData?.transfer && transferData?.codes) {
      const transfer = transferData.transfer;
      const codes = transferData.codes as TransferValidationCode[];
      
      if (transfer.status === 'completed') {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setSimulatedProgress(100);
        setStep('complete');
        return;
      }
      
      const sortedCodes = [...codes].sort((a, b) => a.sequence - b.sequence);
      const validatedCount = transfer.codesValidated || 0;
      const nextCode = sortedCodes[validatedCount];
      
      if (!nextCode) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setSimulatedProgress(100);
        return;
      }
      
      const targetPercent = nextCode.pausePercent || 90;
      
      const justValidated = lastValidatedSequence === nextCode.sequence;
      
      if (simulatedProgress < targetPercent && !isPausedForCode) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        
        progressIntervalRef.current = setInterval(() => {
          setSimulatedProgress(prev => {
            const increment = 0.5;
            const next = prev + increment;
            
            if (next >= targetPercent) {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
              setIsPausedForCode(true);
              return targetPercent;
            }
            
            return next;
          });
        }, 200);
      } else if (simulatedProgress >= targetPercent && !isPausedForCode && !justValidated) {
        setIsPausedForCode(true);
      }
      
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };
    }
  }, [step, transferData, simulatedProgress, isPausedForCode, lastValidatedSequence]);

  useEffect(() => {
    if (transferData?.transfer) {
      const transfer = transferData.transfer;
      
      if (transfer.status === 'completed') {
        setStep('complete');
      } else if (transfer.status === 'pending' || transfer.status === 'in-progress') {
        if (step === 'form') {
          setStep('progress');
          setCurrentCodeSequence((transfer.codesValidated || 0) + 1);
        }
      }
    }
  }, [transferData, step]);

  const handleInitiate = () => {
    if (!amount || !recipient) {
      toast({
        variant: 'destructive',
        title: t.transferFlow.toast.fieldsRequired,
        description: t.transferFlow.toast.fieldsRequiredDesc,
      });
      return;
    }

    if (!loanId) {
      toast({
        variant: 'destructive',
        title: t.transferFlow.toast.error,
        description: 'Veuillez sélectionner un prêt actif pour initier le transfert.',
      });
      return;
    }

    initiateMutation.mutate({
      amount: parseFloat(amount),
      recipient,
      loanId,
      externalAccountId: externalAccountId && externalAccountId !== 'none' ? externalAccountId : null,
    });
  };

  const handleValidateCode = () => {
    if (!validationCode || validationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: t.transferFlow.toast.invalidCode,
        description: t.transferFlow.toast.invalidCodeDesc,
      });
      return;
    }

    validateMutation.mutate({
      code: validationCode,
      sequence: currentCodeSequence,
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
          {t.transferFlow.backToDashboard}
        </Button>

        <Card data-testid="card-transfer-form">
          <CardHeader>
            <CardTitle>{t.transferFlow.form.title}</CardTitle>
            <CardDescription>
              {t.transferFlow.form.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">{t.transferFlow.form.amountLabel}</Label>
              <Input
                id="amount"
                type="number"
                placeholder={t.transferFlow.form.amountPlaceholder}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan">Prêt actif *</Label>
              <Select value={loanId} onValueChange={setLoanId}>
                <SelectTrigger data-testid="select-loan">
                  <SelectValue placeholder="Sélectionnez le prêt pour ce transfert" />
                </SelectTrigger>
                <SelectContent>
                  {!activeLoans || activeLoans.length === 0 ? (
                    <SelectItem value="none" disabled>Aucun prêt actif disponible</SelectItem>
                  ) : (
                    activeLoans.map((loan) => (
                      <SelectItem key={loan.id} value={loan.id}>
                        Prêt #{loan.reference} - {parseFloat(loan.amount).toFixed(2)} EUR ({loan.loanType})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {activeLoans && activeLoans.length === 0 && (
                <p className="text-sm text-destructive">
                  Vous devez avoir un prêt actif avec contrat confirmé pour initier un transfert.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">{t.transferFlow.form.accountLabel}</Label>
              <Select value={externalAccountId} onValueChange={setExternalAccountId}>
                <SelectTrigger data-testid="select-account">
                  <SelectValue placeholder={t.transferFlow.form.accountPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.transferFlow.form.noAccount}</SelectItem>
                  {externalAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountLabel} - {account.iban}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">{t.transferFlow.form.recipientLabel}</Label>
              <Input
                id="recipient"
                placeholder={t.transferFlow.form.recipientPlaceholder}
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
              {initiateMutation.isPending ? t.transferFlow.form.initiating : t.transferFlow.form.initiateButton}
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
              {t.transferFlow.verification.title}
            </CardTitle>
            <CardDescription>
              {t.transferFlow.verification.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" data-testid="alert-verification">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <strong className="text-lg">⚠️ {t.transferFlow.verification.doNotClose}</strong>
                <p className="mt-2">
                  {t.transferFlow.verification.doNotCloseDesc}
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>{t.transferFlow.verification.progressLabel}</span>
                <span className="text-blue-600 dark:text-blue-400" data-testid="text-verification-progress">
                  {Math.round(verificationProgress)}%
                </span>
              </div>
              <Progress 
                value={verificationProgress} 
                className="h-4 bg-gray-200 dark:bg-gray-700"
              />
              <p className="text-sm text-muted-foreground text-center">
                {t.transferFlow.verification.subtitle}
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t.transferFlow.verification.verificationSteps}</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-none">
                    <li className={verificationProgress > 20 ? "text-green-600 dark:text-green-400" : ""}>
                      ✓ {t.transferFlow.verification.step1}
                    </li>
                    <li className={verificationProgress > 40 ? "text-green-600 dark:text-green-400" : ""}>
                      ✓ {t.transferFlow.verification.step2}
                    </li>
                    <li className={verificationProgress > 60 ? "text-green-600 dark:text-green-400" : ""}>
                      ✓ {t.transferFlow.verification.step3}
                    </li>
                    <li className={verificationProgress > 80 ? "text-green-600 dark:text-green-400" : ""}>
                      ✓ {t.transferFlow.verification.step4}
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

  if (step === 'progress') {
    const transfer = transferData?.transfer;
    const codes = transferData?.codes as TransferValidationCode[] || [];
    const sortedCodes = [...codes].sort((a, b) => a.sequence - b.sequence);
    const validatedCount = transfer?.codesValidated || 0;
    const totalCodes = transfer?.requiredCodes || codes.length;
    const nextCode = sortedCodes[validatedCount];

    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <Card data-testid="card-progress">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isPausedForCode ? (
                <>
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                  Transfert en pause
                </>
              ) : (
                <>
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  Transfert en cours
                </>
              )}
            </CardTitle>
            <CardDescription>
              {transfer?.recipient && `Vers: ${transfer.recipient}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progression du transfert</span>
                <span className="font-semibold" data-testid="text-progress">
                  {Math.round(simulatedProgress)}%
                </span>
              </div>
              <Progress value={simulatedProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Codes validés: {validatedCount}/{totalCodes}</span>
                {nextCode && <span>Prochaine pause: {nextCode.pausePercent}%</span>}
              </div>
            </div>

            {isPausedForCode && nextCode ? (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                      Transfert en pause à {Math.round(simulatedProgress)}%
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      Veuillez entrer le code de vérification correspondant pour continuer
                    </p>
                    {nextCode.codeContext && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 italic">
                        {nextCode.codeContext} - Code {validatedCount + 1} sur {totalCodes}
                      </p>
                    )}
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                      L'administrateur vous transmettra ce code manuellement
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pause-code" className="text-sm font-medium">
                    Code de validation (6 chiffres)
                  </Label>
                  <Input
                    id="pause-code"
                    type="text"
                    maxLength={6}
                    value={validationCode}
                    onChange={(e) => setValidationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Entrez le code à 6 chiffres"
                    className="font-mono"
                    data-testid="input-pause-code"
                  />
                </div>

                <Button
                  onClick={handleValidateCode}
                  disabled={validateMutation.isPending || !validationCode || validationCode.length !== 6}
                  className="w-full"
                  data-testid="button-validate-pause-code"
                >
                  {validateMutation.isPending ? 'Validation...' : 'Valider et continuer'}
                </Button>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-sm font-medium">Transfert en cours...</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Le transfert progresse automatiquement. Veuillez patienter.
                </p>
              </div>
            )}

            {transferData?.events && transferData.events.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="font-semibold text-sm">Historique</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto" data-testid="list-events">
                  {transferData.events.slice(0, 5).map((event: any) => (
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
        <Card data-testid="card-complete" className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-6 h-6" />
              {t.transferFlow.complete.title}
            </CardTitle>
            <CardDescription>
              {t.transferFlow.complete.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
              <p className="text-sm text-green-900 dark:text-green-100">
                Votre transfert a été effectué avec succès. Les fonds seront disponibles sous 24 à 72 heures.
              </p>
            </div>

            {transferData?.transfer && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.transferFlow.complete.recipientLabel}</span>
                  <span className="font-medium" data-testid="text-recipient">{transferData.transfer.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.transferFlow.complete.amountLabel}</span>
                  <span className="font-medium" data-testid="text-amount">{transferData.transfer.amount} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Référence</span>
                  <span className="font-mono text-xs" data-testid="text-reference">{transferData.transfer.id}</span>
                </div>
              </div>
            )}

            <Button 
              onClick={() => setLocation('/dashboard')}
              className="w-full"
              data-testid="button-return-dashboard"
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
