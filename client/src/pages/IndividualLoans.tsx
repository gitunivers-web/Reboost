import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/lib/i18n';
import LoanDetailsDialog from '@/components/LoanDetailsDialog';
import AmortizationCalculator from '@/components/AmortizationCalculator';
import { Wallet, Calculator } from 'lucide-react';

interface Loan {
  id: string;
  userId: string;
  amount: string;
  interestRate: string;
  duration: number;
  status: string;
  nextPaymentDate: string | null;
  totalRepaid: string;
  createdAt: string;
}

export default function IndividualLoans() {
  const t = useTranslations();
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: loans, isLoading } = useQuery<Loan[]>({
    queryKey: ['/api/loans'],
  });

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
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleLoanClick = (loan: Loan) => {
    const formattedLoan = {
      id: loan.id,
      amount: parseFloat(loan.amount),
      interestRate: parseFloat(loan.interestRate),
      nextPaymentDate: formatDate(loan.nextPaymentDate),
      totalRepaid: parseFloat(loan.totalRepaid),
      status: loan.status,
    };
    setSelectedLoan(formattedLoan);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">Mes prêts</h1>
          <p className="text-muted-foreground">
            Gérez vos prêts et simulez vos remboursements
          </p>
        </div>

        <Tabs defaultValue="loans" className="w-full" data-testid="tabs-loans">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="loans" data-testid="tab-my-loans">
              <Wallet className="h-4 w-4 mr-2" />
              Mes prêts
            </TabsTrigger>
            <TabsTrigger value="calculator" data-testid="tab-calculator">
              <Calculator className="h-4 w-4 mr-2" />
              Calculateur
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="mt-6 space-y-6">
            {loans && loans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => {
              const progress = (parseFloat(loan.totalRepaid) / parseFloat(loan.amount)) * 100;
              const remainingAmount = parseFloat(loan.amount) - parseFloat(loan.totalRepaid);

              return (
                <Card
                  key={loan.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => handleLoanClick(loan)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Prêt {loan.id.substring(0, 8)}</CardTitle>
                      <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                        {loan.status === 'active' ? 'Actif' : loan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Montant initial</span>
                        <span className="font-mono font-semibold">{formatCurrency(loan.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Taux</span>
                        <span className="font-semibold">{loan.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Durée</span>
                        <span className="font-semibold">{loan.duration} mois</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Prochain paiement</span>
                        <span className="font-semibold">{formatDate(loan.nextPaymentDate)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-semibold">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Remboursé: {formatCurrency(loan.totalRepaid)}</span>
                        <span>Restant: {formatCurrency(remainingAmount.toString())}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aucun prêt actif</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calculator" className="mt-6">
            <AmortizationCalculator />
          </TabsContent>
        </Tabs>
      </div>

      <LoanDetailsDialog 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen}
        loan={selectedLoan}
      />
    </>
  );
}
