import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/lib/i18n';
import { FileText, Download, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { SignedContractUpload } from '@/components/SignedContractUpload';
import { getApiUrl } from '@/lib/queryClient';
import { SectionTitle, GlassPanel, DashboardCard, CONTRACT_STATUS_CONFIG } from '@/components/fintech';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Loan {
  id: string;
  userId: string;
  amount: string;
  interestRate: string;
  duration: number;
  status: string;
  contractStatus: string;
  contractUrl: string | null;
  signedContractUrl: string | null;
  approvedAt: string | null;
  createdAt: string;
  loanReference?: string;
}

export default function Contracts() {
  const t = useTranslations();
  const [uploadingLoanId, setUploadingLoanId] = useState<string | null>(null);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [loanIdToDownload, setLoanIdToDownload] = useState<string | null>(null);

  const { data: loans, isLoading } = useQuery<Loan[]>({
    queryKey: ['/api/loans'],
  });

  const contractsToSign = loans?.filter(
    loan => loan.status === 'approved' && 
    loan.contractStatus === 'awaiting_user_signature' &&
    loan.contractUrl
  ) || [];

  const contractsAwaitingReview = loans?.filter(
    loan => loan.contractStatus === 'awaiting_admin_review'
  ) || [];

  const contractsSigned = loans?.filter(
    loan => loan.contractStatus === 'signed' || 
    (loan.status === 'active' && loan.signedContractUrl)
  ) || [];

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleDownloadContract = (loanId: string) => {
    setLoanIdToDownload(loanId);
    setShowDownloadConfirm(true);
  };

  const handleDownloadSignedContract = async (loanId: string) => {
    try {
      const url = getApiUrl(`/api/loans/${loanId}/signed-contract/download`);
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du contrat signé');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `contrat_signe_${loanId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading signed contract:', error);
    }
  };

  const performDownload = async () => {
    if (!loanIdToDownload) return;
    
    try {
      const url = getApiUrl(`/api/loans/${loanIdToDownload}/contract`);
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du contrat');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `contrat_pret_${loanIdToDownload}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setShowDownloadConfirm(false);
      setLoanIdToDownload(null);
    } catch (error) {
      console.error('Error downloading contract:', error);
      setShowDownloadConfirm(false);
      setLoanIdToDownload(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <SectionTitle
        title={t.contracts?.title || 'Gestion des Contrats'}
        subtitle={t.contracts?.description || 'Téléchargez, signez et renvoyez vos contrats de prêt en toute sécurité'}
      />

      <Tabs defaultValue="pending" className="w-full" data-testid="tabs-contracts">
        <GlassPanel className="p-1">
          <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
            <TabsTrigger 
              value="pending" 
              data-testid="tab-pending-contracts"
              className="gap-2 data-[state=active]:bg-destructive/90 data-[state=active]:text-destructive-foreground data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:-translate-y-0.5 rounded-md"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.contracts?.tabPending || 'À signer'}</span>
              {contractsToSign.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-destructive-foreground/20">
                  {contractsToSign.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="review" 
              data-testid="tab-review-contracts"
              className="gap-2 data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:-translate-y-0.5 rounded-md"
            >
              <Clock className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.contracts?.tabReview || 'En vérification'}</span>
              {contractsAwaitingReview.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {contractsAwaitingReview.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              data-testid="tab-completed-contracts"
              className="gap-2 data-[state=active]:bg-accent/90 data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:-translate-y-0.5 rounded-md"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.contracts?.tabCompleted || 'Terminés'}</span>
              <Badge variant="secondary" className="ml-2">
                {contractsSigned.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </GlassPanel>

        <TabsContent value="pending" className="mt-6 space-y-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 duration-300">
          {contractsToSign.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {contractsToSign.map((loan) => {
                const StatusIcon = CONTRACT_STATUS_CONFIG.awaiting_user_signature.icon;
                return (
                  <DashboardCard 
                    key={loan.id} 
                    data-testid={`card-contract-pending-${loan.id}`}
                    className="bg-gradient-to-br from-destructive/5 to-transparent"
                  >
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">
                            {t.contracts?.loanNumber || 'Prêt'} {loan.loanReference || `#${loan.id.substring(0, 8)}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t.contracts?.approvedOn || 'Approuvé le'} {formatDate(loan.approvedAt)}
                          </p>
                        </div>
                        <Badge variant="destructive" className="shadow-sm">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {t.contracts?.actionRequired || 'Action requise'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-xl">
                          <p className="text-sm text-muted-foreground mb-1">
                            {t.loan?.amount || 'Montant'}
                          </p>
                          <p className="text-xl font-bold">{formatCurrency(loan.amount)}</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-xl">
                          <p className="text-sm text-muted-foreground mb-1">
                            {t.loan?.interestRate || 'Taux'}
                          </p>
                          <p className="text-xl font-bold">{loan.interestRate}%</p>
                        </div>
                      </div>

                      <GlassPanel intensity="medium" className="p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1">
                              {t.contracts?.step1 || '1. Télécharger le contrat'}
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              {t.contracts?.step1Description || 'Téléchargez et lisez attentivement votre contrat de prêt.'}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadContract(loan.id)}
                              className="hover-elevate"
                              data-testid={`button-download-contract-${loan.id}`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t.contracts?.downloadContract || 'Télécharger'}
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 pt-4 border-t">
                          <div className="p-2 rounded-lg bg-accent/10">
                            <Upload className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1">
                              {t.contracts?.step2 || '2. Signer et renvoyer'}
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              {t.contracts?.step2Description || 'Signez le contrat et renvoyez-le au format PDF.'}
                            </p>
                            <div className="max-w-xs">
                              <SignedContractUpload 
                                loanId={loan.id} 
                                loanAmount={loan.amount}
                              />
                            </div>
                          </div>
                        </div>
                      </GlassPanel>
                    </div>
                  </DashboardCard>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium mb-2">
                  {t.contracts?.noPendingContracts || 'Aucun contrat en attente'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.contracts?.noPendingContractsDescription || 'Tous vos contrats ont été signés et envoyés.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="review" className="mt-6 space-y-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 duration-300">
          {contractsAwaitingReview.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {contractsAwaitingReview.map((loan) => (
                <DashboardCard 
                  key={loan.id} 
                  data-testid={`card-contract-review-${loan.id}`}
                  className="bg-gradient-to-br from-primary/5 to-transparent"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">
                          {t.contracts?.loanNumber || 'Prêt'} {loan.loanReference || `#${loan.id.substring(0, 8)}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(loan.amount)} • {loan.interestRate}% • {loan.duration} mois
                        </p>
                      </div>
                      <Badge variant="secondary" className="shadow-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        {t.contracts?.inReview || 'En vérification'}
                      </Badge>
                    </div>

                    <GlassPanel intensity="medium" className="p-5 bg-primary/5 border-primary/20">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 h-fit">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">{t.auth.verificationInProgress}</p>
                          <p className="text-sm text-muted-foreground">
                            {t.contracts?.reviewMessage || 'Votre contrat signé a été reçu et est en cours de vérification par notre équipe. Vous serez notifié dès que les fonds seront débloqués.'}
                          </p>
                        </div>
                      </div>
                    </GlassPanel>
                  </div>
                </DashboardCard>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                  <Clock className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium mb-2">
                  {t.contracts?.noReviewContracts || 'Aucun contrat en vérification'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.contracts?.noReviewContractsDescription || 'Aucun contrat n\'est actuellement en attente de vérification.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 duration-300">
          {contractsSigned.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {contractsSigned.map((loan) => (
                <DashboardCard 
                  key={loan.id} 
                  data-testid={`card-contract-completed-${loan.id}`}
                  className="bg-gradient-to-br from-accent/5 to-transparent"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">
                          {t.contracts?.loanNumber || 'Prêt'} {loan.loanReference || `#${loan.id.substring(0, 8)}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(loan.amount)} • {loan.interestRate}% • {loan.duration} mois
                        </p>
                      </div>
                      <Badge variant="default" className="shadow-sm bg-accent/90 text-accent-foreground">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t.contracts?.signed || 'Signé'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {loan.signedContractUrl && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleDownloadSignedContract(loan.id)}
                          data-testid={`button-download-signed-${loan.id}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t.contracts?.downloadSigned || 'Télécharger le contrat signé'}
                        </Button>
                      )}
                      {loan.signedContractUrl && (
                        <GlassPanel intensity="medium" className="p-4 bg-accent/5 border-accent/20">
                          <p className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                            <span>{t.contracts?.signedSuccess || 'Contrat signé et validé avec succès'}</span>
                          </p>
                        </GlassPanel>
                      )}
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium mb-2">
                  {t.contracts?.noCompletedContracts || 'Aucun contrat signé'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.contracts?.noCompletedContractsDescription || 'Vos contrats signés apparaîtront ici.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDownloadConfirm} onOpenChange={setShowDownloadConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.contracts?.confirmDownload || 'Télécharger le contrat?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.contracts?.confirmDownloadDescription || 'Êtes-vous sûr de vouloir télécharger ce contrat?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel data-testid="button-cancel-download">
              {t.common?.cancel || 'Non'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={performDownload}
              data-testid="button-confirm-download"
            >
              {t.common.confirm}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
