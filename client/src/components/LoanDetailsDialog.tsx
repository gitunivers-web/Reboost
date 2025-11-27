import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { useLocation } from 'wouter';

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
  const t = useTranslations();
  const [, setLocation] = useLocation();

  if (!loan) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const progress = (loan.totalRepaid / loan.amount) * 100;
  const remainingAmount = loan.amount - loan.totalRepaid;

  const handleGoToContracts = () => {
    onOpenChange(false);
    setLocation('/contracts');
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending_review': t.common.pending,
      'approved': t.transfer.approved,
      'active': t.common.active,
      'rejected': t.transfer.rejected,
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'active') return 'default';
    if (status === 'approved') return 'secondary';
    if (status === 'rejected') return 'destructive';
    return 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{t.dashboard.viewDetails}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6 mt-2 sm:mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold">{t.loan.status}</h3>
            <Badge variant={getStatusVariant(loan.status)}>{getStatusText(loan.status)}</Badge>
          </div>

          {loan.status === 'approved' && (
            <div className="border-2 border-primary/20 bg-primary/5 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1 text-base">
                    {t.loan.loanApproved}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t.contracts?.description || 'Téléchargez, signez et renvoyez votre contrat de prêt en toute sécurité.'}
                  </p>
                  <Button
                    onClick={handleGoToContracts}
                    size="sm"
                    variant="default"
                    className="gap-2"
                    data-testid="button-go-to-contracts"
                  >
                    {t.nav.contracts || 'Gérer les contrats'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="border rounded-lg p-2 sm:p-4 space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{t.loan.amount}</span>
              </div>
              <p className="text-lg sm:text-2xl font-mono font-bold">{formatCurrency(loan.amount)}</p>
            </div>

            <div className="border rounded-lg p-2 sm:p-4 space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{t.loan.interestRate}</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold">{loan.interestRate}%</p>
            </div>

            <div className="border rounded-lg p-2 sm:p-4 space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{t.loan.nextPayment}</span>
              </div>
              <p className="text-sm sm:text-lg font-semibold">{loan.nextPaymentDate || 'N/A'}</p>
            </div>

            <div className="border rounded-lg p-2 sm:p-4 space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{t.loan.amount}</span>
              </div>
              <p className="text-lg sm:text-2xl font-mono font-bold">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">{t.dashboard.availableOffers}</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2 sm:h-3" />
            <div className="flex justify-between text-xs sm:text-sm">
              <span>{formatCurrency(loan.totalRepaid)}</span>
              <span>{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
