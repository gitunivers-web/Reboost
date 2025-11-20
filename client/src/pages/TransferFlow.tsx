import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, getApiUrl } from '@/lib/queryClient';
import { ArrowLeft, CheckCircle2, Clock, Send, Shield, AlertCircle, Loader2, AlertTriangle, Building, ArrowRight, Lock, Circle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TransferDetailsResponse, ExternalAccount, TransferCodeMetadata } from '@shared/schema';
import { useTranslations } from '@/lib/i18n';
import { DashboardCard, SectionTitle } from '@/components/fintech';
import CircularTransferProgress from '@/components/CircularTransferProgress';

export default function TransferFlow() {
  const [, params] = useRoute('/transfer/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const t = useTranslations();
  
  const [step, setStep] = useState<'form' | 'progress' | 'complete'>('form');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [externalAccountId, setExternalAccountId] = useState('');
  const [validationCode, setValidationCode] = useState('');
  const [transferId, setTransferId] = useState(params?.id || '');
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [isPausedForCode, setIsPausedForCode] = useState(true);
  const [currentCodeSequence, setCurrentCodeSequence] = useState(1);
  const [lastValidatedSequence, setLastValidatedSequence] = useState(0);
  const [nextCode, setNextCode] = useState<TransferCodeMetadata | null>(null);
  
  const verificationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: externalAccounts } = useQuery<ExternalAccount[]>({
    queryKey: ['/api/external-accounts'],
  });

  const { data: availableLoans, isLoading: isLoadingLoans } = useQuery<any[]>({
    queryKey: ['/api/loans/available-for-transfer'],
  });

  const { data: transferData, refetch: refetchTransfer } = useQuery<TransferDetailsResponse>({
    queryKey: [`/api/transfers/${transferId}`],
    enabled: !!transferId,
    refetchInterval: step === 'progress' ? 3000 : false,
  });

  useEffect(() => {
    if (availableLoans && availableLoans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(availableLoans[0].id);
    }
  }, [availableLoans]);

  const selectedLoan = availableLoans?.find(loan => loan.id === selectedLoanId);
  const amount = selectedLoan ? parseFloat(selectedLoan.amount).toString() : '';

  const initiateMutation = useMutation({
    mutationFn: async (data: any) => {
      const csrfRes = await fetch(getApiUrl('/api/csrf-token'), { credentials: 'include' });
      
      if (!csrfRes.ok) {
        throw new Error('SESSION_EXPIRED');
      }
      
      const { csrfToken } = await csrfRes.json();
      
      if (!csrfToken) {
        throw new Error('SESSION_EXPIRED');
      }
      
      const response = await fetch(getApiUrl('/api/transfers/initiate'), {
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
      
      if (response.status === 403 && (result.code === 'SESSION_INVALID' || result.code === 'CSRF_INVALID')) {
        throw new Error('SESSION_EXPIRED');
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
          title: t.transferFlow.toast.transferInProgressTitle,
          description: t.transferFlow.toast.alreadyInProgressDesc,
        });
        setTimeout(() => {
          setLocation(`/transfer/${data.existingTransferId}`);
        }, 1000);
        return;
      }
      
      setTransferId(data.transfer.id);
      setIsPausedForCode(true);
      // CORRECTION: Utiliser la progression du backend au lieu de hardcoder 0
      setSimulatedProgress(data.transfer.progressPercent || 0);
      toast({
        title: t.transferFlow.toast.initiated,
        description: t.transferFlow.toast.initiatedSuccessDesc,
      });
      
      setStep('progress');
    },
    onError: (error: Error) => {
      if (error.message === 'SESSION_EXPIRED') {
        toast({
          variant: 'destructive',
          title: t.transferFlow.toast.error,
          description: 'Votre session a expiré. Vous allez être redirigé vers la page de connexion.',
          duration: 5000,
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      toast({
        variant: 'destructive',
        title: t.transferFlow.toast.error,
        description: error.message || t.transferFlow.toast.errorInitiation,
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
    if (step === 'progress' && transferData?.transfer) {
      const transfer = transferData.transfer;
      const codes = transferData.codes || [];
      const nextSequence = transferData.nextSequence;
      
      // CORRECTION PROBLÈME 1: Utiliser transfer.progressPercent du backend comme source de vérité
      const backendProgress = transfer.progressPercent || 0;
      
      if (transfer.status === 'completed') {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setSimulatedProgress(100);
        setStep('complete');
        return;
      }
      
      // Utiliser nextSequence du backend pour trouver le prochain code
      const computedNextCode = nextSequence 
        ? codes.find(c => c.sequence === nextSequence) || null
        : null;
      
      setNextCode(computedNextCode);
      
      // Si la progression simulée est très différente du backend, synchroniser
      if (Math.abs(simulatedProgress - backendProgress) > 5) {
        setSimulatedProgress(backendProgress);
      }
      
      // Si pas de code suivant (transfert terminé ou en attente), utiliser la progression du backend
      if (!computedNextCode || !nextSequence) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setSimulatedProgress(backendProgress);
        setIsPausedForCode(true);
        return;
      }
      
      const targetPercent = computedNextCode.pausePercent || 90;
      const justValidated = lastValidatedSequence === nextSequence - 1;
      
      // SÉCURITÉ CRITIQUE: Ne progresser QUE si un code vient d'être validé
      // Sinon, le transfert DOIT rester en pause
      if (justValidated && simulatedProgress < targetPercent && !isPausedForCode) {
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
      } else if (!justValidated) {
        // FORCER la pause tant qu'aucun code n'a été validé
        setIsPausedForCode(true);
      }
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
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
        description: t.transferFlow.toast.selectExternalAccountDesc,
      });
      return;
    }

    if (!selectedLoan) {
      toast({
        variant: 'destructive',
        title: t.transferFlow.toast.error,
        description: 'Aucun prêt disponible pour transfert. Veuillez vous assurer que votre prêt est approuvé et que les fonds sont disponibles.',
      });
      return;
    }

    initiateMutation.mutate({
      amount: parseFloat(amount),
      recipient,
      loanId: selectedLoan.id,
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
      <div className="bg-background">
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

          {!isLoadingLoans && (!availableLoans || availableLoans.length === 0) && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    {t.transferFlow.alerts.noLoansTitle}
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {t.transferFlow.alerts.noLoansDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <DashboardCard 
              title={t.transferFlow.form.cardTitle}
              icon={Send}
              iconColor="text-primary"
              testId="card-transfer-form"
              className="bg-gradient-to-br from-primary/5 via-background to-background"
            >
              <div className="space-y-6">
                {availableLoans && availableLoans.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="loan" className="text-sm font-medium">
                      Sélectionner le prêt
                    </Label>
                    <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                      <SelectTrigger data-testid="select-loan" className="h-12">
                        <SelectValue placeholder="Choisir un prêt" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLoans.map((loan) => (
                          <SelectItem key={loan.id} value={loan.id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {parseFloat(loan.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {loan.loanType} - Approuvé le {new Date(loan.approvedAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    {t.transferFlow.form.amountLabel}
                  </Label>
                  <div className="relative">
                    <div
                      id="amount"
                      className="flex h-14 w-full rounded-md border border-input bg-muted px-3 py-2 text-2xl font-bold ring-offset-background cursor-not-allowed opacity-75 pr-12"
                      data-testid="input-amount"
                    >
                      {amount || t.transferFlow.form.amountPlaceholder}
                    </div>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
                      €
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      {t.transferFlow.form.amountFixedHelper}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account" className="text-sm font-medium">
                    {t.transferFlow.form.beneficiaryAccountLabel}
                  </Label>
                  <Select value={externalAccountId} onValueChange={setExternalAccountId}>
                    <SelectTrigger data-testid="select-account" className="h-12">
                      <SelectValue placeholder={t.transferFlow.form.selectExternalAccount} />
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
              title={t.transferFlow.security.title}
              icon={Shield}
              iconColor="text-green-600 dark:text-green-400"
              className="bg-gradient-to-br from-green-500/5 via-background to-background"
            >
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{t.transferFlow.security.sepaSecureTitle}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t.transferFlow.security.sepaSecureDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{t.transferFlow.security.kycAmlTitle}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t.transferFlow.security.kycAmlDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{t.transferFlow.security.processingTimeTitle}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t.transferFlow.security.processingTimeDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{t.transferFlow.security.strongAuthTitle}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t.transferFlow.security.strongAuthDesc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">
                        {t.transferFlow.security.securityCodesTitle}
                      </p>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        {t.transferFlow.security.securityCodesDesc}
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

  if (step === 'progress') {
    const transfer = transferData?.transfer;
    const codes = transferData?.codes as TransferValidationCode[] || [];
    const sortedCodes = [...codes].sort((a, b) => a.sequence - b.sequence);
    const validatedCount = transfer?.codesValidated || 0;
    const totalCodes = transfer?.requiredCodes || codes.length;
    const nextCode = sortedCodes[validatedCount];

    const progressSteps = [
      { 
        label: t.transferFlow.progress.steps.step1, 
        completed: simulatedProgress > 0,
        inProgress: simulatedProgress > 0 && simulatedProgress <= 17
      },
      { 
        label: t.transferFlow.progress.steps.step2, 
        completed: simulatedProgress > 17,
        inProgress: simulatedProgress > 17 && simulatedProgress <= 33
      },
      { 
        label: t.transferFlow.progress.steps.step3, 
        completed: simulatedProgress > 33,
        inProgress: simulatedProgress > 33 && simulatedProgress <= 50
      },
      { 
        label: t.transferFlow.progress.steps.step4, 
        completed: simulatedProgress > 50,
        inProgress: simulatedProgress > 50 && simulatedProgress <= 67
      },
      { 
        label: t.transferFlow.progress.steps.step5, 
        completed: simulatedProgress > 67,
        inProgress: simulatedProgress > 67 && simulatedProgress <= 84
      },
      { 
        label: t.transferFlow.progress.steps.step6, 
        completed: simulatedProgress >= 100,
        inProgress: simulatedProgress > 84 && simulatedProgress < 100
      },
    ];

    return (
      <div className="bg-background">
        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
          
          {/* BANNIÈRE HORIZONTALE AVEC FLUX ANIMÉ */}
          <div className="w-full bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-blue-950/30 rounded-2xl p-6 sm:p-8 border border-blue-100 dark:border-blue-900/50 shadow-sm">
            <div className="flex items-center justify-center gap-6 sm:gap-12">
              {/* Banque expéditrice */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center border-2 border-blue-200 dark:border-blue-800 shadow-md">
                  <Building className="w-8 h-8 sm:w-10 sm:h-10 text-[#2563EB]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3">ALTUS</p>
              </div>

              {/* Animation du flux */}
              <div className="flex items-center gap-2 relative">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-[#2563EB] animate-pulse" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>

              {/* Banque destinataire */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center border-2 border-cyan-200 dark:border-cyan-800 shadow-md">
                  <Building className="w-8 h-8 sm:w-10 sm:h-10 text-[#0EA5E9]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3">
                  {transfer?.recipient?.split(' ')[0] || 'Banque'}
                </p>
              </div>
            </div>
          </div>

          {/* LAYOUT DEUX COLONNES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            
            {/* COLONNE GAUCHE - Informations du transfert */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 sm:p-10 border border-gray-100 dark:border-gray-800 space-y-6">
              <div className="space-y-6">
                {/* Montant du transfert */}
                <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t.transferFlow.progress.transferAmountLabel}</p>
                  <p className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-gray-100">
                    {transfer?.amount || '0'}<span className="text-3xl sm:text-4xl ml-2">€</span>
                  </p>
                </div>

                {/* Expéditeur */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t.transferFlow.progress.senderLabel}</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{t.transferFlow.progress.senderValue}</p>
                  </div>
                </div>

                {/* Destinataire */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-[#0EA5E9]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t.transferFlow.progress.recipientLabel}</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
                      {transfer?.recipient || t.transferFlow.progress.recipientDefault}
                    </p>
                  </div>
                </div>

                {/* Référence */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t.transferFlow.progress.referenceLabel}</p>
                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 break-all">
                      {transfer?.id || 'TRX-2025-00000'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message de sécurité */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t.transferFlow.progress.secureProcessingMessage}
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {t.transferFlow.progress.aesSecurityBadge}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE - Progression circulaire */}
            <div className="space-y-6">
              
              {/* Carte avec progression circulaire */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center">
                  {/* Cercle de progression */}
                  <div className="relative w-56 h-56 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="112"
                        cy="112"
                        r="100"
                        stroke="currentColor"
                        strokeWidth="14"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#2563EB" />
                          <stop offset="100%" stopColor="#0EA5E9" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="112"
                        cy="112"
                        r="100"
                        stroke="url(#progressGradient)"
                        strokeWidth="14"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 100}`}
                        strokeDashoffset={`${2 * Math.PI * 100 * (1 - simulatedProgress / 100)}`}
                        className="transition-all duration-700 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] bg-clip-text text-transparent">
                        {Math.round(simulatedProgress)}%
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t.transferFlow.progress.progressLabelShort}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">{t.transferFlow.progress.transferProgressLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des étapes */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-800">
                <div className="space-y-4">
                  {progressSteps.map((stepItem, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 rounded-xl transition-all hover-elevate"
                    >
                      <div className="mt-0.5">
                        {stepItem.completed ? (
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                        ) : stepItem.inProgress ? (
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Circle className="w-3 h-3 text-gray-400 dark:text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          stepItem.completed 
                            ? 'text-gray-900 dark:text-gray-100' 
                            : stepItem.inProgress 
                            ? 'text-[#2563EB]' 
                            : 'text-gray-400 dark:text-gray-600'
                        }`}>
                          {stepItem.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section sécurité */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {t.transferFlow.progress.secureBankingProtocols}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t.transferFlow.progress.aesMultiLevelAuth}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section de validation de code (si nécessaire) */}
          {isPausedForCode && nextCode && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl shadow-lg p-6 sm:p-8 border border-orange-200 dark:border-orange-800">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {t.transferFlow.progress.securityCheckRequired}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {t.transferFlow.progress.enterCodeSecurityMessage}
                    </p>
                    {nextCode.codeContext && (
                      <p className="text-xs text-orange-700 dark:text-orange-300 italic">
                        {nextCode.codeContext}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {t.transferFlow.progress.codeProvidedByAdvisor}
                    </p>
                  </div>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <Label htmlFor="pause-code" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t.transferFlow.progress.validationCodeSixDigits}
                  </Label>
                  <Input
                    id="pause-code"
                    type="text"
                    maxLength={6}
                    value={validationCode}
                    onChange={(e) => setValidationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="font-mono text-3xl text-center tracking-widest h-16 bg-white dark:bg-gray-800"
                    data-testid="input-pause-code"
                  />
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
                      {t.transferFlow.progress.validatingAction}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t.transferFlow.progress.validateContinueButton}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
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
                {t.transferFlow.complete.successMessageLong}
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
                  <span className="text-muted-foreground">{t.transferFlow.complete.reference}</span>
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
              {t.transferFlow.complete.returnButton}
            </Button>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return null;
}
