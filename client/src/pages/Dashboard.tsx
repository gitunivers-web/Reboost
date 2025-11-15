import { useTranslations } from '@/lib/i18n';
import { useDashboard, useUpcomingRepaymentsChart } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  TrendingUp,
  Wallet,
  Clock,
  ArrowRight,
  Plus,
  Send,
  FileSignature,
  Eye,
  Download
} from 'lucide-react';
import { Link } from 'wouter';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { LoanRequestModal } from '@/components/LoanRequestModal';
import { SignedContractUpload } from '@/components/SignedContractUpload';
import { useState } from 'react';
import { DashboardCard, SectionTitle, UserStat } from '@/components/fintech';

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    </div>
  );
}

const getMockCashflowData = (t: ReturnType<typeof useTranslations>) => [
  { month: t.dashboard.monthJan, income: 55000, expenses: 42000 },
  { month: t.dashboard.monthFeb, income: 58000, expenses: 45000 },
  { month: t.dashboard.monthMar, income: 52000, expenses: 43000 },
  { month: t.dashboard.monthApr, income: 60000, expenses: 48000 },
  { month: t.dashboard.monthMay, income: 62000, expenses: 50000 },
  { month: t.dashboard.monthJun, income: 61000, expenses: 49000 },
];

export default function Dashboard() {
  const t = useTranslations();
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboard();
  const { data: repaymentsData, isLoading: isRepaymentsLoading } = useUpcomingRepaymentsChart();
  const { data: user } = useUser();
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  
  const mockCashflowData = getMockCashflowData(t);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = t.dashboard.goodMorning;
    if (hour < 12) greeting = t.dashboard.goodMorning;
    else if (hour < 18) greeting = t.dashboard.goodAfternoon;
    else greeting = t.dashboard.goodEvening;
    
    if (user) {
      const firstName = user.fullName.split(' ')[0];
      return `${greeting}, ${firstName}`;
    }
    return greeting;
  };

  if (isDashboardLoading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData || dashboardError) {
    const isDev = import.meta.env.DEV;
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <DashboardCard className="bg-destructive/5 border-destructive/20">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-destructive mb-1">{t.dashboard.dataLoadError}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.serverError}
                </p>
              </div>
              
              {isDev && (
                <details className="text-xs bg-muted/50 rounded-xl p-4">
                  <summary className="cursor-pointer font-medium text-foreground mb-2">
                    {t.dashboard.diagnosticInfo}
                  </summary>
                  <div className="mt-2 space-y-1 font-mono">
                    <p><strong>API URL:</strong> {apiUrl}/api/dashboard</p>
                    <p><strong>Erreur:</strong> {dashboardError ? String(dashboardError) : "Aucune donnée reçue"}</p>
                    <p><strong>Variables d'environnement:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>VITE_API_URL: {import.meta.env.VITE_API_URL || "(non défini)"}</li>
                      <li>NODE_ENV: {import.meta.env.MODE}</li>
                    </ul>
                  </div>
                </details>
              )}
              
              <Button
                onClick={() => window.location.reload()}
                data-testid="button-retry-dashboard"
              >
                {t.dashboard.retry}
              </Button>
            </div>
          </div>
        </DashboardCard>
      </div>
    );
  }

  const creditUtilization = dashboardData.borrowingCapacity.maxCapacity > 0
    ? ((dashboardData.borrowingCapacity.maxCapacity - dashboardData.borrowingCapacity.currentCapacity) / dashboardData.borrowingCapacity.maxCapacity) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto animate-fade-in">
        {/* Hero Section - Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t.dashboard.financeOverview}
          </p>
        </div>

        {/* Balance Hero Card - Fintech Premium */}
        <DashboardCard className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6 flex-1">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                  {t.dashboard.totalBalance}
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight break-all" data-testid="text-total-balance">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(dashboardData.balance.currentBalance)}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6" data-testid="section-balance-kpis">
                <UserStat
                  label={t.dashboard.availableCredit}
                  value={dashboardData.balance.availableCredit}
                  currency
                  testId="text-available-credit"
                />
                <UserStat
                  label={t.dashboard.activeLoans}
                  value={dashboardData.balance.activeLoansCount}
                  icon={CreditCard}
                  testId="text-active-loans-count"
                />
                <UserStat
                  label={t.dashboard.totalBorrowed}
                  value={dashboardData.balance.totalBorrowed}
                  currency
                  testId="text-total-borrowed"
                />
              </div>
            </div>

            {/* Trend Visualization */}
            <div className="h-24 sm:h-32 w-full lg:w-96 flex items-end" data-testid="chart-balance-trend">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { month: 1, value: 45000 },
                  { month: 2, value: 48000 },
                  { month: 3, value: 47500 },
                  { month: 4, value: 50000 },
                  { month: 5, value: 52000 },
                  { month: 6, value: dashboardData.balance.currentBalance },
                ]}>
                  <defs>
                    <linearGradient id="balanceTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fill="url(#balanceTrend)" 
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DashboardCard>

        {/* Quick Actions - Fintech Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/transfer/new">
            <Button size="lg" className="gap-2 shadow-md w-full" data-testid="button-new-transfer">
              <Send className="w-4 h-4" />
              <span className="text-sm sm:text-base">{t.dashboard.newTransfer}</span>
            </Button>
          </Link>
          <Button 
            size="lg"
            variant="outline" 
            className="gap-2 w-full" 
            onClick={() => setLoanModalOpen(true)}
            data-testid="button-request-loan"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">{t.dashboard.requestLoan}</span>
          </Button>
          <Link href="/accounts">
            <Button size="lg" variant="outline" className="gap-2 w-full" data-testid="button-manage-accounts">
              <Wallet className="w-4 h-4" />
              <span className="text-sm sm:text-base">{t.dashboard.manageAccounts}</span>
            </Button>
          </Link>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Cashflow Chart - Stripe Style */}
          <DashboardCard 
            title={t.dashboard.cashflow}
            subtitle={t.dashboard.incomeExpensesSixMonths}
            className="lg:col-span-2"
          >
            <div className="h-64 sm:h-72 md:h-80" data-testid="chart-cashflow">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockCashflowData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    fill="url(#incomeGradient)"
                    name={t.dashboard.income}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#expensesGradient)"
                    name={t.dashboard.expenses}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          {/* Borrowing Capacity - Modern Card */}
          <DashboardCard
            title={t.dashboard.borrowingCapacity}
            subtitle={t.dashboard.yourCreditLimit}
            icon={Wallet}
            iconColor="text-primary"
          >
            <div className="space-y-6 mt-4">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t.dashboard.used}</span>
                  <span className="text-2xl font-bold text-foreground">
                    {creditUtilization.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
                    style={{ width: `${creditUtilization}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t.dashboard.maximum}</p>
                  <p className="text-lg font-bold text-foreground" data-testid="text-max-capacity">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(dashboardData.borrowingCapacity.maxCapacity)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t.dashboard.available}</p>
                  <p className="text-lg font-bold text-accent" data-testid="text-current-capacity">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(dashboardData.borrowingCapacity.currentCapacity)}
                  </p>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Loans & Repayments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Active Loans */}
          <DashboardCard
            title={t.dashboard.activeLoans}
            subtitle={`${dashboardData.loans.length} ${dashboardData.loans.length === 1 ? t.dashboard.activeLoanSingular : t.dashboard.activeLoansPlural}`}
            icon={CreditCard}
            iconColor="text-primary"
            headerAction={
              <Link href="/loans">
                <Button variant="ghost" size="sm" className="gap-1">
                  <span className="text-xs">{t.dashboard.viewAll}</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            }
          >
            <div className="space-y-3 mt-4">
              {dashboardData.loans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.dashboard.noActiveLoans}
                  </p>
                </div>
              ) : (
                dashboardData.loans.slice(0, 3).map((loan, index) => {
                  const progress = loan.totalRepaid ? (Number(loan.totalRepaid) / Number(loan.amount)) * 100 : 0;
                  
                  return (
                    <div 
                      key={loan.id}
                      className="p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group"
                      data-testid={`loan-item-${loan.id}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {t.dashboard.loanNumber}{loan.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {loan.interestRate}% APR
                          </p>
                        </div>
                        <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                          {loan.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.dashboard.amount}</span>
                          <span className="font-semibold">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(loan.amount))}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{t.dashboard.progression}</span>
                            <span className="font-medium text-accent">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </DashboardCard>

          {/* Upcoming Repayments */}
          <DashboardCard
            title={t.dashboard.upcomingRepayments}
            subtitle={t.dashboard.nextSixMonths}
            icon={Clock}
            iconColor="text-primary"
          >
            {isRepaymentsLoading ? (
              <div className="space-y-3 mt-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : repaymentsData && repaymentsData.length > 0 ? (
              <div className="h-64 mt-4" data-testid="chart-upcoming-repayments">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={repaymentsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-lg)',
                      }}
                      formatter={(value: number) => [
                        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value),
                        t.dashboard.repayment
                      ]}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.noUpcomingRepayments}
                </p>
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Contracts Section - Optional */}
        {(dashboardData as any).pendingContracts && (dashboardData as any).pendingContracts.length > 0 && (
          <DashboardCard
            title={t.dashboard.pendingContracts}
            subtitle={`${(dashboardData as any).pendingContracts.length} ${t.dashboard.contractsToSign}`}
            icon={FileSignature}
            iconColor="text-amber-600"
            className="bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30"
          >
            <div className="space-y-3 mt-4">
              {(dashboardData as any).pendingContracts.map((contract: any) => (
                <div 
                  key={contract.id}
                  className="p-4 rounded-xl bg-background border border-border flex items-center justify-between"
                  data-testid={`pending-contract-${contract.id}`}
                >
                  <div>
                    <p className="font-semibold text-foreground mb-1">
                      {contract.loanType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.dashboard.generatedOn} {new Date(contract.generatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {contract.pdfUrl && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => window.open(contract.pdfUrl, '_blank')}
                        data-testid={`button-view-contract-${contract.id}`}
                      >
                        <Eye className="w-4 h-4" />
                        {t.dashboard.view}
                      </Button>
                    )}
                    {contract.id && contract.loanId && (
                      <SignedContractUpload 
                        loanId={contract.loanId}
                        loanAmount={contract.amount || 0}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        )}
      </div>

      {/* Modals */}
      {user && (
        <LoanRequestModal 
          user={user}
          open={loanModalOpen} 
          onOpenChange={setLoanModalOpen} 
        />
      )}
    </div>
  );
}
