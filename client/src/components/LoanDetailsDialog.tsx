import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, DollarSign, Download, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  nextPaymentDate: string | null;
  totalRepaid: number;
  status: string;
  contractUrl?: string | null;
  signedContractUrl?: string | null;
}

interface LoanDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan | null;
}

export default function LoanDetailsDialog({ open, onOpenChange, loan }: LoanDetailsDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  if (!loan) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const progress = (loan.totalRepaid / loan.amount) * 100;
  const remainingAmount = loan.amount - loan.totalRepaid;

  const handleContractDownload = async () => {
    try {
      window.open(`/api/loans/${loan.id}/contract`, '_blank');
      toast({
        title: 'Téléchargement du contrat',
        description: 'Votre contrat va être téléchargé.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le contrat.',
        variant: 'destructive',
      });
    }
  };

  const handleSignedContractUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Erreur',
        description: 'Seuls les fichiers PDF sont acceptés.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'Le fichier est trop volumineux (max 10MB).',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('signedContract', file);

      const csrfToken = await fetch('/api/csrf-token').then((res) => res.json()).then((data) => data.csrfToken);

      const response = await fetch(`/api/loans/${loan.id}/upload-signed-contract`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Échec du téléchargement');
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });

      toast({
        title: 'Succès',
        description: 'Contrat signé téléchargé avec succès. Les fonds seront débloqués dans un délai allant de quelques minutes à 24 heures maximum.',
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de télécharger le contrat signé.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'En attente',
      'approved': 'Approuvé',
      'active': 'Actif',
      'signed': 'Signé',
      'rejected': 'Refusé',
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'active' || status === 'signed') return 'default';
    if (status === 'approved') return 'secondary';
    if (status === 'rejected') return 'destructive';
    return 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Détails du prêt</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Statut</h3>
            <Badge variant={getStatusVariant(loan.status)}>{getStatusText(loan.status)}</Badge>
          </div>

          {loan.status === 'approved' && loan.contractUrl && !loan.signedContractUrl && (
            <div className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    Votre contrat est prêt
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Téléchargez votre contrat, signez-le avec la mention "Lu et approuvé", puis téléchargez-le ici.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleContractDownload}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                      data-testid="button-download-contract"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le contrat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="relative border-yellow-300 dark:border-yellow-700"
                      disabled={isUploading}
                      data-testid="button-upload-signed-contract"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Téléchargement...' : 'Télécharger le contrat signé'}
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf"
                        onChange={handleSignedContractUpload}
                        disabled={isUploading}
                        data-testid="input-signed-contract"
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loan.status === 'signed' && loan.signedContractUrl && (
            <div className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Contrat signé reçu
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Votre contrat signé a été reçu. Les fonds seront débloqués dans un délai allant de quelques minutes à 24 heures maximum.
                  </p>
                </div>
              </div>
            </div>
          )}

          {loan.contractUrl && loan.status !== 'approved' && loan.status !== 'signed' && (
            <div className="flex justify-center">
              <Button
                onClick={handleContractDownload}
                variant="outline"
                size="sm"
                data-testid="button-view-contract"
              >
                <FileText className="h-4 w-4 mr-2" />
                Voir le contrat
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Montant initial</span>
              </div>
              <p className="text-2xl font-mono font-bold">{formatCurrency(loan.amount)}</p>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Taux d'intérêt</span>
              </div>
              <p className="text-2xl font-bold">{loan.interestRate}%</p>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Prochain paiement</span>
              </div>
              <p className="text-lg font-semibold">{loan.nextPaymentDate || 'N/A'}</p>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Montant restant</span>
              </div>
              <p className="text-2xl font-mono font-bold">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression du remboursement</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span>Remboursé: {formatCurrency(loan.totalRepaid)}</span>
              <span>Restant: {formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
