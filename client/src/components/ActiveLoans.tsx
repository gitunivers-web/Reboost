import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/lib/i18n';
import { useLocation } from 'wouter';
import { FileSignature } from 'lucide-react';
import LoanDetailsDialog from './LoanDetailsDialog';

interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  nextPaymentDate: string | null;
  totalRepaid: number;
  status: string;
  contractUrl?: string | null;
  signedContractUrl?: string | null;
  loanReference?: string;
}

interface ActiveLoansProps {
  loans: Loan[];
}

export default function ActiveLoans({ loans }: ActiveLoansProps) {
  const t = useTranslations();
  const [, setLocation] = useLocation();
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleLoanClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setDetailsOpen(true);
  };

  const activeAndApprovedLoans = loans.filter(l => l.status === 'active' || l.status === 'approved');
  const activeLoansCount = activeAndApprovedLoans.length;
  const displayedLoans = activeAndApprovedLoans.slice(0, 2);

  return (
    <>
      <Card className="dashboard-card border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="inline-block bg-primary/10 px-3 py-1.5 rounded-full">
            <CardTitle className="text-sm font-semibold text-primary">{t.dashboard.activeLoans}</CardTitle>
          </div>
          {loans.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs px-2"
              data-testid="button-view-all-loans"
              onClick={() => setLocation('/loans')}
            >
              {t.loan.viewAll}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {displayedLoans.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">{t.dashboard.noActiveLoans}</p>
          ) : (
            displayedLoans.map((loan) => {
              const progress = (loan.totalRepaid / loan.amount) * 100;
              const needsSignature = loan.status === 'approved' && loan.contractUrl && !loan.signedContractUrl;
              return (
                <div
                  key={loan.id}
                  className={`p-2 rounded-md border cursor-pointer transition-all space-y-1 ${
                    needsSignature 
                      ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 ring-2 ring-yellow-400/50 dark:ring-yellow-600/50' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                  data-testid={`card-loan-${loan.id}`}
                  onClick={() => handleLoanClick(loan)}
                >
                  {needsSignature && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] px-1.5 py-0 h-5 animate-pulse">
                        <FileSignature className="h-3 w-3 mr-1" />
                        {t.dashboard.contractToSign}
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-medium">{loan.loanReference || `#${loan.id.substring(0, 8)}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(loan.amount)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{loan.interestRate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.loan.nextPayment}: {loan.nextPaymentDate || 'N/A'}
                  </p>
                  <div className="space-y-0.5">
                    <Progress value={progress} className="h-1" />
                    <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
                  </div>
                </div>
              );
            })
          )}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-muted-foreground">{t.dashboard.activeLoans}</span>
            <span className="font-semibold" data-testid="text-active-loans-total">{activeLoansCount}</span>
          </div>
        </CardContent>
      </Card>
      
      <LoanDetailsDialog 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen}
        loan={selectedLoan}
      />
    </>
  );
}
