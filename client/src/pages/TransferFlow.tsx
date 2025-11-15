import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, CheckCircle2, Clock, Send, Shield, AlertCircle, Loader2, AlertTriangle, Building, ArrowRight, Lock, Circle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TransferDetailsResponse, ExternalAccount, TransferValidationCode } from '@shared/schema';
import { useTranslations } from '@/lib/i18n';
import { DashboardCard, SectionTitle } from '@/components/fintech';
import CircularTransferProgress from '@/components/CircularTransferProgress';

export default function TransferFlow() {
  const [, params] = useRoute('/transfer/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const t = useTranslations();
  
  const [step, setStep] = useState<'form' | 'verification' | 'progress' | 'complete'>('form');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [externalAccountId, setExternalAccountId] = useState('');
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
    select: (loans) => loans.filter(loan => loan.status === 'active'),
  });

  const { data: transferData, refetch: refetchTransfer } = useQuery<TransferDetailsResponse>({
    queryKey: [`/api/transfers/${transferId}`],
    enabled: !!transferId,
    refetchInterval: step === 'progress' ? 3000 : false,
  });

  useEffect(() => {
    if (activeLoans && activeLoans.length > 0 && !amount) {
      setAmount(parseFloat(activeLoans[0].amount).toString());
    }
  }, [activeLoans]);

  const initiateMutation = useMutation({
    mutationFn: async (data: any) => {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
      const { csrfToken } = await csrfRes.json();
      
      const response = await fetch('/api/transfers/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.status === 409 && result.redirect && result.existingTransferId) {
        return { redirect: true, existingTransferId: result.existingTransferId };
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate transfer');
      }
      
      return result;
    },
    onSuccess: (data: any) => {
      if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      
      if (data.redirect && data.existingTransferId) {
        toast({
          title: 'Transfert en cours',
          description: 'Un transfert est déjà en cours pour ce prêt. Redirection...',
        });
        setTimeout(() => {
          setLocation(`/transfer/${data.existingTransferId}`);
        }, 1000);
        return;
      }
      
      setTransferId(data.transfer.id);
      toast({
        title: t.transferFlow.toast.initiated,
        description: 'Transfert initié avec succès. Vérification en cours...',
      });
      
      setStep('verification');
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

    if (!externalAccountId || externalAccountId === 'none') {
      toast({
        variant: 'destructive',
        title: t.transferFlow.toast.error,
        description: 'Veuillez sélectionner un compte externe.',
      });
      return;
    }

    const activeLoan = activeLoans?.[0];
    if (!activeLoan) {
      toast({
        variant: 'destructive',
        title: t.transferFlow.toast.error,
        description: 'Aucun prêt actif disponible.',
      });
      return;
    }

    initiateMutation.mutate({
      amount: parseFloat(amount),
      recipient,
      loanId: activeLoan.id,
      externalAccountId,
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
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="mb-2 hover-elevate"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.transferFlow.backToDashboard}
          </Button>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {t.transferFlow.form.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t.transferFlow.form.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <DashboardCard 
              title="Détails du transfert"
              icon={Send}
              iconColor="text-primary"
              testId="card-transfer-form"
              className="bg-gradient-to-br from-primary/5 via-background to-background"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    {t.transferFlow.form.amountLabel}
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder={t.transferFlow.form.amountPlaceholder}
                      value={amount}
                      readOnly
                      disabled
                      className="cursor-not-allowed opacity-75 bg-muted text-2xl font-bold h-14 pr-12"
                      data-testid="input-amount"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
                      €
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      Montant fixe basé sur votre prêt actif (non modifiable)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account" className="text-sm font-medium">
                    Compte bénéficiaire *
                  </Label>
                  <Select value={externalAccountId} onValueChange={setExternalAccountId}>
                    <SelectTrigger data-testid="select-account" className="h-12">
                      <SelectValue placeholder="Sélectionner un compte externe" />
                    </SelectTrigger>
                    <SelectContent>
                      {externalAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{account.accountLabel}</span>
                            <span className="text-xs text-muted-foreground font-mono">{account.iban}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient" className="text-sm font-medium">
                    {t.transferFlow.form.recipientLabel}
                  </Label>
                  <Input
                    id="recipient"
                    placeholder={t.transferFlow.form.recipientPlaceholder}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="h-12"
                    data-testid="input-recipient"
                  />
                </div>

                <Button 
                  onClick={handleInitiate}
                  disabled={initiateMutation.isPending}
                  className="w-full shadow-lg"
                  size="lg"
                  data-testid="button-initiate"
                >
                  {initiateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.transferFlow.form.initiating}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t.transferFlow.form.initiateButton}
                    </>
                  )}
                </Button>
              </div>
            </DashboardCard>

            <DashboardCard 
              title="Sécurité & Conformité"
              icon={Shield}
              iconColor="text-green-600 dark:text-green-400"
              className="bg-gradient-to-br from-green-500/5 via-background to-background"
            >
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Transfert SEPA sécurisé</h4>
                      <p className="text-xs text-muted-foreground">
                        Vos fonds sont protégés par le protocole bancaire européen SEPA avec chiffrement AES-256
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Vérification KYC/AML</h4>
                      <p className="text-xs text-muted-foreground">
                        Contrôles anti-blanchiment et connaissance client conformes aux normes européennes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Délai de traitement</h4>
                      <p className="text-xs text-muted-foreground">
                        Les fonds seront disponibles sous 24 à 72 heures ouvrées selon votre banque
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Authentification renforcée</h4>
                      <p className="text-xs text-muted-foreground">
                        Validation en plusieurs étapes pour garantir la sécurité de votre transaction
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">
                        Codes de sécurité requis
                      </p>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        Des codes de validation vous seront demandés pendant le processus. Gardez votre téléphone à portée de main.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <SectionTitle
          title={t.transferFlow.verification.title}
          subtitle={t.transferFlow.verification.subtitle}
        />
        <DashboardCard 
          icon={Shield}
          iconColor="text-blue-600 dark:text-blue-400"
          testId="card-verification"
        >
          <div className="space-y-6">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" data-testid="alert-verification">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <strong className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {t.transferFlow.verification.doNotClose}
                </strong>
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
          </div>
        </DashboardCard>
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

    const progressSteps = [
      { 
        label: 'Initialisation du transfert', 
        completed: simulatedProgress > 0,
        threshold: 0
      },
      { 
        label: 'Contrôle KYC & AML', 
        completed: simulatedProgress > 20,
        threshold: 20
      },
      { 
        label: 'Vérification des fonds', 
        completed: simulatedProgress > 40,
        threshold: 40
      },
      { 
        label: 'Validation bancaire', 
        completed: simulatedProgress > 60,
        threshold: 60
      },
      { 
        label: 'Finalisation & Release', 
        completed: simulatedProgress >= 100,
        threshold: 100
      },
    ];

    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-primary/10">
                <Building className="w-6 h-6 sm:w-10 sm:h-10 text-primary" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-2 sm:mt-3">Compte ALTUS</p>
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="w-6 h-6 sm:w-10 sm:h-10 text-primary animate-pulse" />
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2 hidden sm:block">En transit</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-green-500/10">
                <Building className="w-6 h-6 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-2 sm:mt-3">{transfer?.recipient?.split(' ')[0] || 'Banque'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Suivi du Transfert
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Votre transfert est en cours de traitement sécurisé.
            </p>
          </div>

          <DashboardCard 
            title="Informations du transfert"
            icon={Send}
            iconColor="text-primary"
            className="bg-gradient-to-br from-primary/5 via-background to-background"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Montant</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground break-all">{transfer?.amount || '0'} €</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">De</p>
                <p className="text-xs sm:text-sm font-semibold">Compte ALTUS</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Vers</p>
                <p className="text-xs sm:text-sm font-semibold break-words">{transfer?.recipient || 'Banque SEPA'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Référence</p>
                <p className="text-xs font-mono font-semibold break-all">{transfer?.id || 'TRX-2025-00000'}</p>
              </div>
            </div>
          </DashboardCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <DashboardCard 
              title="Progression"
              icon={TrendingUp}
              iconColor="text-green-600 dark:text-green-400"
              className="bg-gradient-to-br from-green-500/5 via-background to-background"
            >
              <div className="space-y-4">
                {progressSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover-elevate transition-all">
                    <div className="mt-1">
                      {step.completed ? (
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <Circle className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard className="bg-gradient-to-br from-primary/5 via-background to-background">
              <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted/20"
                    />
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 100}`}
                      strokeDashoffset={`${2 * Math.PI * 100 * (1 - simulatedProgress / 100)}`}
                      className="text-primary transition-all duration-700 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-foreground">{Math.round(simulatedProgress)}%</span>
                    <span className="text-sm text-muted-foreground mt-2">Progression</span>
                    <span className="text-xs text-muted-foreground">du transfert</span>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>

          <DashboardCard 
            icon={Lock}
            iconColor="text-blue-600 dark:text-blue-400"
            className="bg-gradient-to-br from-blue-500/5 via-background to-background border-blue-200/20 dark:border-blue-800/20"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Sécurisé par protocoles bancaires
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  AES-256 + authentification en cascades conforme aux normes européennes
                </p>
              </div>
            </div>
          </DashboardCard>

          {isPausedForCode && nextCode && (
            <DashboardCard 
              title="Vérification de sécurité requise"
              icon={AlertCircle}
              iconColor="text-orange-600 dark:text-orange-400"
              className="bg-gradient-to-br from-orange-500/10 via-background to-background border-orange-200/30 dark:border-orange-800/30"
            >
              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                  <p className="text-sm text-orange-900 dark:text-orange-100">
                    Pour des raisons de sécurité, veuillez saisir le code de vérification qui vous a été transmis
                  </p>
                  {nextCode.codeContext && (
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-2 italic">
                      {nextCode.codeContext}
                    </p>
                  )}
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                    Le code de sécurité vous sera communiqué par votre conseiller
                  </p>
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
                    placeholder="••••••"
                    className="font-mono text-2xl text-center tracking-widest h-14"
                    data-testid="input-pause-code"
                  />
                </div>

                <Button
                  onClick={handleValidateCode}
                  disabled={validateMutation.isPending || !validationCode || validationCode.length !== 6}
                  className="w-full shadow-lg"
                  size="lg"
                  data-testid="button-validate-pause-code"
                >
                  {validateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Valider et continuer
                    </>
                  )}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <SectionTitle
          title={t.transferFlow.complete.title}
          subtitle={t.transferFlow.complete.subtitle}
        />
        <DashboardCard 
          icon={CheckCircle2}
          iconColor="text-green-600 dark:text-green-400"
          testId="card-complete"
        >
          <div className="space-y-6">
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
              size="lg"
              data-testid="button-return-dashboard"
            >
              Retour au tableau de bord
            </Button>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return null;
}
