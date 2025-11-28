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
import { useTranslations, useLanguage } from '@/lib/i18n';
import { DashboardCard, SectionTitle } from '@/components/fintech';
import CircularTransferProgress from '@/components/CircularTransferProgress';

// Helper function to get locale code from language
function getLocaleCode(language: string): string {
  const localeMap: Record<string, string> = {
    'fr': 'fr-FR',
    'en': 'en-US',
    'es': 'es-ES',
    'pt': 'pt-PT',
    'it': 'it-IT',
    'de': 'de-DE',
    'nl': 'nl-NL',
  };
  return localeMap[language] || 'fr-FR';
}

// Helper function to translate code contexts
function translateCodeContext(codeContext: string | null | undefined, t: ReturnType<typeof useTranslations>): string {
  if (!codeContext) return t.transferFlow.progress.validationCodeLabel;
  
  // Map legacy French values to translation keys for backward compatibility
  const legacyFrenchToKeyMap: Record<string, keyof typeof t.transferFlow.progress.codeContexts> = {
    'Code de conformité réglementaire': 'regulatory_compliance',
    'Code d\'autorisation de transfert': 'transfer_authorization',
    'Code de vérification de sécurité': 'security_verification',
    'Code de déblocage de fonds': 'funds_release',
    'Code de validation finale': 'final_validation',
    'Code de frais d\'assurance': 'insurance_fee',
  };
  
  // First check if it's a legacy French value
  const mappedKey = legacyFrenchToKeyMap[codeContext];
  if (mappedKey && t.transferFlow.progress.codeContexts[mappedKey]) {
    return t.transferFlow.progress.codeContexts[mappedKey];
  }
  
  // Check if it's already a translation key
  const key = codeContext as keyof typeof t.transferFlow.progress.codeContexts;
  if (t.transferFlow.progress.codeContexts[key]) {
    return t.transferFlow.progress.codeContexts[key];
  }
  
  // Fallback to the raw value if not a known key
  return codeContext;
}

// Type pour la réponse de l'API transfert actif
interface ActiveTransferResponse {
  hasActiveTransfer: boolean;
  transfer?: {
    id: string;
    status: string;
    progressPercent: number;
    codesValidated: number;
    requiredCodes: number;
    amount: string;
    recipient: string;
    createdAt: string;
    loanId: string | null;
  };
  loan?: {
    id: string;
    amount: string;
    loanType: string;
  } | null;
}

export default function TransferFlow() {
  const [, params] = useRoute('/transfer/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const t = useTranslations();
  const { language } = useLanguage();
  const locale = getLocaleCode(language);
  
  const [step, setStep] = useState<'form' | 'progress' | 'complete'>('form');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [externalAccountId, setExternalAccountId] = useState('');
  const [validationCode, setValidationCode] = useState('');
  const [transferId, setTransferId] = useState('');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [isCheckingActiveTransfer, setIsCheckingActiveTransfer] = useState(!params?.id);
  const [isLoadingExistingTransfer, setIsLoadingExistingTransfer] = useState(false);
  
  // Helper: Check if it's a real transfer ID (not "new" or empty)
  const isRealTransferId = (id?: string): boolean => {
    return !!id && id !== 'new' && id.length > 0;
  };
  
  // Sync transferId with params.id whenever it changes
  useEffect(() => {
    if (params?.id) {
      if (isRealTransferId(params.id)) {
        // Real transfer ID - load existing transfer
        setTransferId(params.id);
        setIsLoadingExistingTransfer(true);
      } else if (params.id === 'new') {
        // New transfer - reset to form mode
        setTransferId('');
        setStep('form');
        setIsLoadingExistingTransfer(false);
      }
    } else {
      // No ID at all - check for active transfer
      setTransferId('');
    }
  }, [params?.id]);
  
  // CORRECTION BUG: Utiliser null pour détecter l'hydratation initiale
  // Les valeurs null indiquent que l'état n'a pas encore été hydraté depuis le backend
  const [simulatedProgress, setSimulatedProgress] = useState<number | null>(null);
  const [isPausedForCode, setIsPausedForCode] = useState<boolean | null>(null);
  const [currentCodeSequence, setCurrentCodeSequence] = useState<number | null>(null);
  const [lastValidatedSequence, setLastValidatedSequence] = useState<number | null>(null);
  const [nextCode, setNextCode] = useState<TransferCodeMetadata | null>(null);
  
  const verificationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Ref pour suivre si l'hydratation initiale a été faite (éviter les ré-animations)
  const initialHydrationDoneRef = useRef(false);
  const lastHydratedTransferIdRef = useRef<string | null>(null);
  
  // Refs pour la gestion des validations et animations
  const prevCodesValidatedRef = useRef<number | null>(null);
  const justValidatedRef = useRef(false);
  // CORRECTION BUG: Ref pour tracker la dernière séquence pour laquelle on a animé vers le target
  // Empêche les ré-animations infinies lors des polls
  const lastAnimatedToTargetSequenceRef = useRef<number | null>(null);

  // Vérifier si un transfert est déjà en cours pour cet utilisateur
  const { data: activeTransferData, isLoading: isLoadingActiveTransfer } = useQuery<ActiveTransferResponse>({
    queryKey: ['/api/transfers/active'],
    enabled: !params?.id, // Ne vérifier que si on n'a pas déjà un ID de transfert dans l'URL
  });

  // Redirection automatique vers le transfert en cours
  useEffect(() => {
    if (!params?.id && !isLoadingActiveTransfer && activeTransferData?.hasActiveTransfer && activeTransferData.transfer) {
      const activeTransfer = activeTransferData.transfer;
      
      // Afficher une notification de reprise
      toast({
        title: t.transferFlow.toast.transferInProgressTitle || 'Transfert en cours',
        description: `${t.transferFlow.toast.alreadyInProgressDesc || 'Reprise du transfert'} (${activeTransfer.progressPercent}%)`,
      });
      
      // Rediriger vers le transfert en cours après un court délai
      setTimeout(() => {
        setLocation(`/transfer/${activeTransfer.id}`);
      }, 500);
    } else if (!params?.id && !isLoadingActiveTransfer) {
      setIsCheckingActiveTransfer(false);
    }
  }, [params?.id, isLoadingActiveTransfer, activeTransferData, setLocation, toast, t]);

  const { data: externalAccounts } = useQuery<ExternalAccount[]>({
    queryKey: ['/api/external-accounts'],
  });

  const { data: availableLoans, isLoading: isLoadingLoans } = useQuery<any[]>({
    queryKey: ['/api/loans/available-for-transfer'],
  });

  const { data: transferData, refetch: refetchTransfer, isLoading: isLoadingTransferData } = useQuery<TransferDetailsResponse>({
    queryKey: [`/api/transfers/${transferId}`],
    enabled: isRealTransferId(transferId),
    refetchInterval: step === 'progress' ? 3000 : false,
  });

  // HYDRATATION PRINCIPALE: reconstituer l'état du composant depuis le backend au chargement / changement d'ID
  // Cette hydratation est la SOURCE DE VÉRITÉ - elle doit s'exécuter UNE SEULE FOIS par transferId
  useEffect(() => {
    if (!isRealTransferId(transferId)) return;
    
    if (isLoadingTransferData) return;
    
    // IMPORTANT: TOUJOURS sortir du loading, même s'il n'y a pas de data
    setIsLoadingExistingTransfer(false);
    
    if (!transferData?.transfer) {
      // Transfer doesn't exist - redirect back to Transfers page
      setLocation('/transfers');
      return;
    }
    
    const server = transferData.transfer;
    const codes = transferData.codes || [];
    const nextSeqFromServer = transferData.nextSequence ?? (server.codesValidated + 1);
    
    // CORRECTION CRITIQUE: Si on a déjà hydraté ce même transferId, NE PAS réhydrater/écraser à chaque poll
    // Cela évite d'écraser les animations en cours ou les états locaux après une validation
    if (lastHydratedTransferIdRef.current === server.id && initialHydrationDoneRef.current) {
      // Ne rien faire - laisser l'autre useEffect gérer les mises à jour de progression
      return;
    }
    
    // Marquer l'hydratation faite pour cet ID AVANT de mettre à jour les états
    lastHydratedTransferIdRef.current = server.id;
    initialHydrationDoneRef.current = true;
    
    // Handle completed status separately
    if (server.status === 'completed') {
      setStep('complete');
      setSimulatedProgress(100);
      setLastValidatedSequence(server.codesValidated ?? 0);
      setCurrentCodeSequence(null);
      setIsPausedForCode(false);
      setNextCode(null);
      return;
    }
    
    // For all other statuses: show progress page
    setStep('progress');
    
    // HYDRATER LES VALEURS CLÉS DEPUIS LE BACKEND (SOURCE OF TRUTH)
    const codesValidated = server.codesValidated ?? 0;
    
    // Si le transfert est en pause sur un pausePercent, utiliser pausePercent comme progression
    const backendProgress = (server.isPaused && server.pausePercent != null) 
      ? server.pausePercent 
      : (server.progressPercent ?? 0);
    
    setSimulatedProgress(backendProgress);
    setLastValidatedSequence(codesValidated);
    setCurrentCodeSequence(nextSeqFromServer);
    
    // Déterminer le prochain code metadata si existant (non consommé)
    const nextCodeMeta = codes.find(c => c.sequence === nextSeqFromServer) ?? null;
    setNextCode(nextCodeMeta);
    
    // Déterminer si on doit afficher le champ de code
    // On est en pause si:
    // 1. Le backend dit explicitement isPaused = true
    // 2. OU si la progression actuelle >= pausePercent du code en attente
    // 
    // CORRECTION BUG CRITIQUE: Si prevCodesValidatedRef.current === null, c'est un nouveau
    // transfert initié depuis le formulaire. Dans ce cas, NE PAS forcer isPausedForCode à false
    // car l'animation va s'en occuper et le mettre à true quand elle atteint le seuil.
    const isNewlyInitiatedTransfer = prevCodesValidatedRef.current === null;
    
    if (server.isPaused) {
      setIsPausedForCode(true);
    } else if (nextCodeMeta && nextCodeMeta.pausePercent) {
      const targetPercent = nextCodeMeta.pausePercent;
      // Si la progression actuelle est >= au pourcentage cible - 1, on attend un code
      const shouldPause = backendProgress >= targetPercent - 1;
      // Pour un nouveau transfert, ne pas forcer à false - laisser l'animation gérer
      if (shouldPause || !isNewlyInitiatedTransfer) {
        setIsPausedForCode(shouldPause);
      }
    } else if (!isNewlyInitiatedTransfer) {
      // Ne pas forcer à false pour un nouveau transfert
      setIsPausedForCode(false);
    }
    
    // ⚠️ TRÈS IMPORTANT: Mettre à jour les refs pour éviter les fausses détections
    // CORRECTION BUG CRITIQUE: Si prevCodesValidatedRef est null, cela signifie qu'on vient
    // d'initier un transfert depuis le formulaire (via initiateMutation.onSuccess).
    // Dans ce cas, NE PAS écraser la valeur null - laisser l'animation useEffect détecter
    // que c'est un nouveau transfert et lancer l'animation automatique vers le premier seuil.
    if (prevCodesValidatedRef.current !== null) {
      prevCodesValidatedRef.current = codesValidated;
    }
    justValidatedRef.current = false;
    lastAnimatedToTargetSequenceRef.current = codesValidated > 0 ? nextSeqFromServer : null;
    
  }, [transferId, transferData, isLoadingTransferData, setLocation]);

  // LIGNE 57-93 - FONCTION D'ANIMATION AJOUTÉE (modifiée)
  // Ajout : animationRunningRef pour éviter réentrance; on vérifie nextSequence à la fin.
  const animationRunningRef = useRef(false);
  const animateProgress = (from: number, to: number, durationMs: number, expectedNextSequence?: number) => {
    // si animation déjà en cours, ne rien faire
    if (animationRunningRef.current) return;
    animationRunningRef.current = true;

    // Cancel previous
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    const startTime = performance.now();
    const delta = to - from;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease-out pour une progression naturelle
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = from + (delta * easeProgress);
      setSimulatedProgress(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // verrouiller la valeur finale proprement
        setSimulatedProgress(to);
        animationFrameRef.current = null;
        // vérifie que nextSequence attendu n'a pas changé entre-temps
        try {
          const currentNext = transferData?.nextSequence;
          if (expectedNextSequence == null || currentNext === expectedNextSequence) {
            setIsPausedForCode(true);
          } else {
            // si le nextSequence a changé, ne pas forcer la pause
          }
        } finally {
          animationRunningRef.current = false;
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

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
      
      // CORRECTION PROBLÈME 1: Animation automatique jusqu'au premier pausePercent
      const initialProgress = data.transfer.progressPercent || 0;
      setSimulatedProgress(initialProgress);
      setLastValidatedSequence(0);
      setCurrentCodeSequence(1);
      
      // CRITIQUE: Initialiser les refs pour permettre l'animation du nouveau transfert
      prevCodesValidatedRef.current = null; // null = nouveau transfert, déclenche isNewTransfer
      initialHydrationDoneRef.current = false; // Pas encore hydraté
      lastAnimatedToTargetSequenceRef.current = null; // Permettre l'animation vers le premier target
      
      // Démarrer en mode NON-PAUSÉ pour permettre l'animation automatique vers le premier code
      setIsPausedForCode(false);
      
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
          title: t.auth.sessionExpired,
          description: t.auth.sessionExpiredMessage,
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
      
      // CORRECTION: Faire disparaitre le champ de code immédiatement après validation
      // Il réapparaitra au prochain code si nécessaire après le refetch du serveur
      setIsPausedForCode(false);
      
      // Construire le message de succès traduit
      const baseMessage = data.isComplete 
        ? t.transferFlow.progress.statusCompleted 
        : t.transferFlow.toast.codeValidated;
      
      toast({
        title: baseMessage,
        duration: 3000,
      });
      
      // CORRECTION: Marquer qu'une validation vient de se produire pour déclencher l'animation
      justValidatedRef.current = true;
      
      // CORRECTION: Si le serveur retourne progress/pausePercent, appliquer directement
      // Cela garantit que l'UI reflète immédiatement l'état du backend après validation
      if (typeof data.progress === 'number') {
        setSimulatedProgress(data.progress);
      }
      
      if (data.isPaused === true && typeof data.pausePercent === 'number') {
        setIsPausedForCode(true);
        setSimulatedProgress(data.pausePercent);
      } else {
        setIsPausedForCode(false);
      }
      
      // Mettre à jour les séquences localement pour réactivité immédiate
      const newLast = (lastValidatedSequence ?? 0) + 1;
      setLastValidatedSequence(newLast);
      setCurrentCodeSequence((prev) => (prev != null ? prev + 1 : (newLast + 1)));
      
      setNextCode(null);
      
      // Recharger serveur pour garantir la source de vérité
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
      
      const backendProgress = transfer.progressPercent || 0;
      const currentCodesValidated = transfer.codesValidated || 0;
      
      if (transfer.status === 'completed') {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setSimulatedProgress(100);
        setStep('complete');
        prevCodesValidatedRef.current = currentCodesValidated;
        justValidatedRef.current = false;
        return;
      }
      
      // Utiliser nextSequence du backend pour trouver le prochain code
      const computedNextCode = nextSequence 
        ? codes.find(c => c.sequence === nextSequence) || null
        : null;
      
      setNextCode(computedNextCode);
      
      // Si pas de code suivant (transfert terminé ou en attente), utiliser la progression du backend
      if (!computedNextCode || !nextSequence) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setSimulatedProgress(backendProgress);
        setIsPausedForCode(false);
        prevCodesValidatedRef.current = currentCodesValidated;
        justValidatedRef.current = false;
        return;
      }
      
      const targetPercent = computedNextCode.pausePercent || 90;
      
      // CORRECTION CRITIQUE: Détecter si une validation VIENT de se produire via la mutation
      // La ref justValidatedRef est mise à true dans validateMutation.onSuccess
      const isNewValidation = justValidatedRef.current;
      
      // Nouveau transfert fraîchement initié: première séquence, aucun code validé
      // Un nouveau transfert a codesValidated === 0, progressPercent faible, et c'est le premier chargement (prevCodesValidatedRef === null)
      // On vérifie aussi que la progression est inférieure au target pour éviter de relancer l'animation
      const isNewTransfer = prevCodesValidatedRef.current === null && 
                           currentCodesValidated === 0 && 
                           nextSequence === 1 &&
                           backendProgress < targetPercent;
      
      // CORRECTION BUG: Vérifier si on a DÉJÀ animé vers ce target pour cette séquence
      // Cela empêche les boucles infinies lors des polls de refetch
      const alreadyAnimatedToTarget = lastAnimatedToTargetSequenceRef.current === nextSequence;
      
      // Utiliser 0 comme valeur par défaut si simulatedProgress est null
      const currentSimulatedProgress = simulatedProgress ?? 0;
      
      // Animation UNIQUEMENT si:
      // 1. Une validation vient de se produire (justValidatedRef.current = true)
      // 2. C'est un nouveau transfert fraîchement initié (première animation vers le premier checkpoint)
      // ET on n'a pas déjà animé vers ce target pour cette séquence
      const shouldAnimate = (isNewValidation || isNewTransfer) && 
                           currentSimulatedProgress < targetPercent &&
                           !alreadyAnimatedToTarget;
      
      // CORRECTION BUG: Détecter le retour sur un transfert existant où la progression doit continuer
      // C'est le cas quand:
      // 1. Ce n'est PAS une nouvelle validation
      // 2. Ce n'est PAS un nouveau transfert
      // 3. La progression backend est > 0 et < targetPercent (transfert en cours)
      // 4. On n'a PAS déjà animé vers ce target pour cette séquence
      // 5. L'animation n'est pas déjà en cours
      const shouldContinueAnimation = !isNewValidation && 
                                      !isNewTransfer &&
                                      !alreadyAnimatedToTarget &&
                                      !animationRunningRef.current &&
                                      backendProgress > 0 &&
                                      backendProgress < targetPercent &&
                                      currentSimulatedProgress < targetPercent;
      
      if (shouldAnimate) {
        // Calculer la durée dynamiquement : 1 seconde par point de pourcentage
        const progressDelta = targetPercent - currentSimulatedProgress;
        const duration = progressDelta * 1000;
        animateProgress(currentSimulatedProgress, targetPercent, duration, computedNextCode?.sequence);
        // Marquer qu'on a animé vers ce target pour cette séquence
        lastAnimatedToTargetSequenceRef.current = nextSequence;
        // Réinitialiser la ref après avoir lancé l'animation
        justValidatedRef.current = false;
      } else if (shouldContinueAnimation) {
        // CORRECTION BUG: Continuer l'animation depuis backendProgress vers targetPercent
        // Ceci gère le cas où l'utilisateur revient sur un transfert en cours
        const progressDelta = targetPercent - backendProgress;
        const duration = progressDelta * 1000;
        
        // D'abord synchroniser avec le backend
        setSimulatedProgress(backendProgress);
        
        // Marquer qu'on va animer vers ce target pour cette séquence (AVANT le setTimeout)
        lastAnimatedToTargetSequenceRef.current = nextSequence;
        
        // Puis animer vers le target après un court délai pour laisser React mettre à jour
        setTimeout(() => {
          animateProgress(backendProgress, targetPercent, duration, computedNextCode?.sequence);
        }, 100);
      } else {
        // CAS: Pas d'animation nécessaire
        // Synchroniser simulatedProgress avec backendProgress SI on n'est pas déjà au bon niveau
        // et si on n'a pas d'animation en cours
        if (!animationRunningRef.current) {
          // Si on a atteint le pourcentage cible, mettre en pause pour le code
          if (backendProgress >= targetPercent) {
            setSimulatedProgress(backendProgress);
            setIsPausedForCode(true);
            // Marquer comme animé pour éviter les reboucles
            lastAnimatedToTargetSequenceRef.current = nextSequence;
            // Annuler toute animation en cours
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          } else if (alreadyAnimatedToTarget && currentSimulatedProgress >= targetPercent - 1) {
            // On a déjà animé vers ce target et on y est, rester en pause
            setIsPausedForCode(true);
          }
        }
      }
      
      // Marquer l'hydratation comme faite
      initialHydrationDoneRef.current = true;
      
      // Mettre à jour la référence
      prevCodesValidatedRef.current = currentCodesValidated;
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [step, transferData]);

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
        title: t.transferFlow.toast.noActiveLoan,
        description: t.transferFlow.alerts.noLoansDescription,
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
      sequence: currentCodeSequence ?? 1,
    });
  };

  // Afficher un écran de chargement pendant la vérification du transfert actif ou du transfert existant
  // IMPORTANT: Pour les transferts existants (UUID valid), ne JAMAIS montrer le formulaire. Afficher loading ou progress uniquement.
  if (isCheckingActiveTransfer || (isLoadingActiveTransfer && !params?.id) || isLoadingExistingTransfer || (isRealTransferId(transferId) && step === 'form')) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {t.transferFlow.progress.titleInProgress || 'Vérification en cours...'}
          </p>
        </div>
      </div>
    );
  }

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
                      {t.nav.loans}
                    </Label>
                    <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                      <SelectTrigger data-testid="select-loan" className="h-12">
                        <SelectValue placeholder={t.amortization.chooseLoan} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLoans.map((loan) => (
                          <SelectItem key={loan.id} value={loan.id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {parseFloat(loan.amount).toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {loan.loanType} - {t.contracts.approvedOn} {new Date(loan.approvedAt).toLocaleDateString(locale)}
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
                    <SelectTrigger data-testid="select-account" className="h-12 overflow-visible [&>span]:line-clamp-none [&>span]:flex [&>span]:flex-col [&>span]:gap-0">
                      {externalAccountId && externalAccounts ? (
                        <div className="flex flex-col items-start gap-0 pointer-events-none select-none w-full">
                          <span className="font-medium text-sm leading-none line-clamp-none">{externalAccounts.find(a => a.id === externalAccountId)?.accountLabel}</span>
                          <span className="text-xs text-muted-foreground font-mono leading-none line-clamp-none">{externalAccounts.find(a => a.id === externalAccountId)?.iban}</span>
                        </div>
                      ) : (
                        <SelectValue placeholder={t.transferFlow.form.selectExternalAccount} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {externalAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id} className="bg-transparent hover:bg-transparent no-default-hover-elevate focus:bg-transparent">
                          <div className="flex flex-col items-start gap-0">
                            <span className="font-medium text-sm">{account.accountLabel}</span>
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

  // Composant cercle de progression animé
  const ProgressCircle = ({ percent }: { percent: number }) => {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full rotate-[-90deg]">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="url(#grad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={Math.PI * 2 * 58}
            strokeDashoffset={(1 - percent / 100) * Math.PI * 2 * 58}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute text-center">
          <p className="text-2xl font-semibold text-primary">{percent}%</p>
          <span className="text-xs text-muted-foreground">{t.transferFlow.progress.progressLabelShort}</span>
        </div>
      </div>
    );
  };

  if (step === 'progress') {
    const transfer = transferData?.transfer;
    const codes = transferData?.codes || [];
    const sortedCodes = [...codes].sort((a, b) => a.sequence - b.sequence);
    const validatedCount = transfer?.codesValidated || 0;
    const totalCodes = transfer?.requiredCodes || codes.length;
    const nextCode = sortedCodes[validatedCount];

    const allStepsMetadata = [
      { 
        id: 'step1',
        sequence: 1,
        label: t.transferFlow.progress.steps.step1,
        pauseThreshold: 17,
        hidden: false
      },
      { 
        id: 'step2',
        sequence: 2,
        label: t.transferFlow.progress.steps.step2,
        pauseThreshold: 33,
        hidden: false
      },
      { 
        id: 'step3',
        sequence: 3,
        label: t.transferFlow.progress.steps.step3,
        pauseThreshold: 50,
        hidden: false
      },
      { 
        id: 'step4',
        sequence: 4,
        label: t.transferFlow.progress.steps.step4,
        pauseThreshold: 67,
        hidden: false
      },
      { 
        id: 'step5',
        sequence: 5,
        label: t.transferFlow.progress.steps.step5,
        pauseThreshold: 84,
        hidden: false
      },
      { 
        id: 'step6',
        sequence: 6,
        label: t.transferFlow.progress.steps.step6,
        pauseThreshold: 100,
        hidden: true
      },
    ];

    const computeVisibleSteps = () => {
      // Use server progress for display, fall back to simulated (with null guard)
      const currentProgress = transfer?.progressPercent ?? simulatedProgress ?? 0;
      
      // Helper pour calculer le statut de chaque étape
      const getStepStatus = (step: typeof allStepsMetadata[0]) => ({
        ...step,
        completed: currentProgress > step.pauseThreshold,
        inProgress: currentProgress > (step.sequence === 1 ? 0 : allStepsMetadata[step.sequence - 2].pauseThreshold) 
                    && currentProgress <= step.pauseThreshold
      });

      // Step 1 et Step 2 sont TOUJOURS visibles
      const step1 = getStepStatus(allStepsMetadata[0]); // Initialisation
      const step2 = getStepStatus(allStepsMetadata[1]); // Contrôle KYC

      // La 3ème position change selon la progression
      let thirdStep;
      if (currentProgress <= 33) {
        thirdStep = getStepStatus(allStepsMetadata[2]); // Step 3: Vérification des fonds
      } else if (currentProgress <= 50) {
        thirdStep = getStepStatus(allStepsMetadata[3]); // Step 4: Validation bancaire
      } else {
        thirdStep = getStepStatus(allStepsMetadata[4]); // Step 5: Finalisation
      }

      return [step1, step2, thirdStep];
    };

    const progressSteps = computeVisibleSteps();

    // Cartes de rendu
    const renderTransferMainCard = () => (
      <div className="bg-white shadow-sm rounded-xl p-6 space-y-6">
        {/* Montant du transfert */}
        <div className="text-center pb-6 border-b border-border">
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
            {t.transferFlow.progress.transferAmountLabel}
          </p>
          <p className="text-5xl sm:text-6xl font-bold text-foreground">
            {transfer?.amount || '0'}<span className="text-3xl sm:text-4xl ml-2">€</span>
          </p>
        </div>

        {/* Expéditeur */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {t.transferFlow.progress.senderLabel}
            </p>
            <p className="text-base font-semibold text-foreground">
              {t.transferFlow.progress.senderValue}
            </p>
          </div>
        </div>

        {/* Destinataire */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Building className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {t.transferFlow.progress.recipientLabel}
            </p>
            <p className="text-base font-semibold text-foreground break-words">
              {transfer?.recipient || t.transferFlow.progress.recipientDefault}
            </p>
          </div>
        </div>

        {/* Référence */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {t.transferFlow.progress.referenceLabel}
            </p>
            <p className="text-sm font-mono font-semibold text-foreground break-all">
              {transfer?.id || 'TRX-2025-00000'}
            </p>
          </div>
        </div>
      </div>
    );

    const renderStepsCard = () => (
      <div className="bg-white shadow-sm rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t.transferFlow.progress.stepsTitle}</h3>
        <div className="space-y-3">
          {progressSteps.map((stepItem, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover-elevate">
              <div className="mt-0.5">
                {stepItem.completed ? (
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  </div>
                ) : stepItem.inProgress ? (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Circle className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  stepItem.completed 
                    ? 'text-foreground' 
                    : stepItem.inProgress 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}>
                  {stepItem.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const renderProgressCard = () => (
      <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col items-center">
        <ProgressCircle percent={Math.round(simulatedProgress ?? 0)} />
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">{t.transferFlow.progress.progressLabelShort} {t.transferFlow.progress.transferProgressLabel}</p>
        </div>
      </div>
    );

    const renderSecurityCard = () => (
      <div className="bg-muted/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              {t.transferFlow.progress.secureBankingProtocols}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.transferFlow.progress.aesMultiLevelAuth}
            </p>
          </div>
        </div>
      </div>
    );

    const renderValidationCard = () => {
      if (!isPausedForCode || !nextCode) return null;
      
      return (
        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {t.transferFlow.progress.securityCheckRequired}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {t.transferFlow.progress.enterCodeSecurityMessage}
                </p>
                {nextCode.codeContext && (
                  <p className="text-xs text-orange-700 dark:text-orange-300 italic mt-2">
                    {translateCodeContext(nextCode.codeContext, t)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Input
                id="validation-code"
                type="text"
                maxLength={6}
                value={validationCode}
                onChange={(e) => setValidationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="font-mono text-xl text-center tracking-widest h-12"
                data-testid="input-pause-code"
              />
              <Button
                onClick={handleValidateCode}
                disabled={validateMutation.isPending || !validationCode || validationCode.length !== 6}
                className="w-full"
                size="sm"
                data-testid="button-validate-pause-code"
              >
                {validateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.transferFlow.progress.validating}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t.transferFlow.progress.validateAndContinue}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="w-full flex justify-center px-4 py-6">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne de gauche : infos transfert */}
          <div className="col-span-2 flex flex-col gap-6">
            {renderTransferMainCard()}
            {renderStepsCard()}
          </div>

          {/* Colonne de droite : progression + sécurité */}
          <div className="col-span-1 flex flex-col gap-6">
            {renderProgressCard()}
            {renderSecurityCard()}
            {renderValidationCard()}
          </div>

        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <SectionTitle
          title={t.transferFlow.complete.title}
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
