import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/lib/i18n';
import LoanDetailsDialog from '@/components/LoanDetailsDialog';
import { Wallet, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { SectionTitle, GlassPanel, DashboardCard, LOAN_STATUS_CONFIG } from '@/components/fintech';

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
  loanReference?: string;
}

export default function IndividualLoans() {
  const t = useTranslations();
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: loans, isLoading } = useQuery<Loan[]>({
    queryKey: ['/api/loans'],
  });

  const activeLoans = useMemo(() => {
    return loans?.filter(loan => loan.status === 'active' || loan.status === 'approved') || [];
  }, [loans]);

  const pendingLoans = useMemo(() => {
    return loans?.filter(loan => loan.status === 'pending_review') || [];
  }, [loans]);

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
      <div className="p-6 md:p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 overflow-x-hidden">
        <SectionTitle
          title={t.loan.pageTitle}
          subtitle={t.loan.pageDescription}
        />

        <div className="mt-6 space-y-6">
          <Tabs defaultValue="active" className="w-full" data-testid="tabs-loan-status">
              <GlassPanel className="p-1 overflow-x-auto">
                <TabsList className="grid w-full grid-cols-2 min-w-fit bg-transparent gap-1">
                  <TabsTrigger 
                    value="active" 
                    data-testid="tab-active-loans"
                    className="gap-2 data-[state=active]:bg-accent/90 data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:-translate-y-0.5 rounded-md whitespace-nowrap"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">{t.dashboard.activeLoans}</span>
                    <Badge variant="secondary" className="ml-2 bg-background">
                      {activeLoans.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    data-testid="tab-pending-loans"
                    className="gap-2 data-[state=active]:bg-secondary/90 data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:-translate-y-0.5 rounded-md whitespace-nowrap"
                  >
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm whitespace-nowrap">{t.common.pending}</span>
                    <Badge variant="secondary" className="ml-2 bg-background">
                      {pendingLoans.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </GlassPanel>

              <TabsContent value="active" className="mt-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 duration-300">
                {activeLoans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeLoans.map((loan) => {
                      const progress = (parseFloat(loan.totalRepaid) / parseFloat(loan.amount)) * 100;
                      const remainingAmount = parseFloat(loan.amount) - parseFloat(loan.totalRepaid);
                      const StatusIcon = loan.status === 'active' ? TrendingUp : CheckCircle2;

                      return (
                        <div
                          key={loan.id}
                          className="cursor-pointer"
                          onClick={() => handleLoanClick(loan)}
                        >
                          <DashboardCard
                            className="hover-elevate bg-gradient-to-br from-accent/5 to-transparent transition-all duration-300 hover:shadow-xl h-full"
                            testId={`card-active-loan-${loan.id}`}
                          >
                            <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-accent/10">
                                  <StatusIcon className="h-4 w-4 text-accent" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{t.loan.loanNumber}</h3>
                                  <p className="text-xs text-muted-foreground">{loan.loanReference || `#${loan.id.substring(0, 8)}`}</p>
                                </div>
                              </div>
                              <Badge variant="default" className="bg-accent/90 text-accent-foreground shadow-sm">
                                {loan.status === 'active' ? t.common.active : t.loan.status}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t.loan.amount}</span>
                                <span className="font-mono font-semibold text-lg">{formatCurrency(loan.amount)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t.loan.interestRate}</span>
                                <span className="font-semibold">{loan.interestRate}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t.dialogs.newLoan.duration}</span>
                                <span className="font-semibold">{loan.duration} {t.dialogs.newLoan.months}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t.loan.nextPayment}</span>
                                <span className="font-semibold">{formatDate(loan.nextPaymentDate)}</span>
                              </div>
                            </div>

                            </div>
                          </DashboardCard>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                      <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                      <p className="text-lg font-medium mb-2">{t.dashboard.noActiveLoans}</p>
                      <p className="text-sm text-muted-foreground">{t.dashboard.noActiveLoansDesc}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 duration-300">
                {pendingLoans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingLoans.map((loan) => (
                      <DashboardCard
                        key={loan.id}
                        className="bg-gradient-to-br from-secondary/5 to-transparent"
                        testId={`card-pending-loan-${loan.id}`}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-secondary/10">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{t.loan.loanNumber}</h3>
                                <p className="text-xs text-muted-foreground">{loan.loanReference || `#${loan.id.substring(0, 8)}`}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="shadow-sm">
                              <Clock className="h-3 w-3 mr-1" />
                              {t.common.pending}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{t.loan.amount}</span>
                              <span className="font-mono font-semibold text-lg">{formatCurrency(loan.amount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{t.loan.interestRate}</span>
                              <span className="font-semibold">{loan.interestRate}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{t.dialogs.newLoan.duration}</span>
                              <span className="font-semibold">{loan.duration} {t.dialogs.newLoan.months}</span>
                            </div>
                          </div>

                          <GlassPanel intensity="medium" className="p-4 bg-secondary/5">
                            <p className="text-sm text-muted-foreground">
                              {t.loan.reviewInProgress}
                            </p>
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
                      <p className="text-lg font-medium mb-2">{t.loan.noPendingRequests}</p>
                      <p className="text-sm text-muted-foreground">{t.loan.noPendingRequestsDesc}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedLoan && (
        <LoanDetailsDialog
          loan={selectedLoan}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  );
}
