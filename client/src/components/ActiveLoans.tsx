import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/lib/i18n';
import { useLocation } from 'wouter';
import LoanDetailsDialog from './LoanDetailsDialog';

interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  nextPaymentDate: string | null;
  totalRepaid: number;
  status: string;
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
    }).format(amount);
  };

  const handleLoanClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setDetailsOpen(true);
  };

  const activeLoansCount = loans.filter(l => l.status === 'active').length;
  const displayedLoans = loans.slice(0, 2);

  return (
    <>
      <Card className="shadow-sm border bg-white dark:bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.activeLoans}</CardTitle>
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
            <p className="text-sm text-muted-foreground py-2">Aucun prêt actif</p>
          ) : (
            displayedLoans.map((loan) => {
              const progress = (loan.totalRepaid / loan.amount) * 100;
              return (
                <div
                  key={loan.id}
                  className="p-2 rounded-md border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors space-y-1"
                  data-testid={`card-loan-${loan.id}`}
                  onClick={() => handleLoanClick(loan)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(loan.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        Remboursé: {formatCurrency(loan.totalRepaid)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{loan.interestRate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Prochain: {loan.nextPaymentDate || 'N/A'}
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
            <span className="text-muted-foreground">Total actifs</span>
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
