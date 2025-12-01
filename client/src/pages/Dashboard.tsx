import { useTranslations, useLanguage } from '@/lib/i18n';
import { useDashboard, useUpcomingRepaymentsChart } from '@/hooks/use-dashboard';
import { useUserStats } from '@/hooks/use-user-stats';
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
  Download,
  FileText,
  Star,
  Sparkles,
  Circle,
  Check,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { LoanRequestModal } from '@/components/LoanRequestModal';
import { SignedContractUpload } from '@/components/SignedContractUpload';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DashboardCard, SectionTitle, UserStat, PremiumIcon } from '@/components/fintech';

function getContractsNotificationText(language: string) {
  const translations: Record<string, { title: string; messageSingular: string; messagePlural: string; buttonLabel: string }> = {
    fr: {
      title: 'Contrats en attente de signature',
      messageSingular: 'Vous avez 1 contrat à signer. Complétez-le pour activer votre prêt.',
      messagePlural: 'Vous avez {count} contrats à signer. Complétez-les pour activer vos prêts.',
      buttonLabel: 'Voir',
    },
    en: {
      title: 'Contracts Awaiting Signature',
      messageSingular: 'You have 1 contract to sign. Complete it to activate your loan.',
      messagePlural: 'You have {count} contracts to sign. Complete them to activate your loans.',
      buttonLabel: 'View',
    },
    de: {
      title: 'Unterzeichnungspflichtige Verträge',
      messageSingular: 'Sie haben 1 Vertrag zu unterzeichnen. Vollständig es, um Ihr Darlehen zu aktivieren.',
      messagePlural: 'Sie haben {count} Verträge zu unterzeichnen. Vollständig sie, um Ihre Darlehen zu aktivieren.',
      buttonLabel: 'Ansehen',
    },
    pt: {
      title: 'Contratos Pendentes de Assinatura',
      messageSingular: 'Você tem 1 contrato para assinar. Conclua-o para ativar seu empréstimo.',
      messagePlural: 'Você tem {count} contratos para assinar. Conclua-os para ativar seus empréstimos.',
      buttonLabel: 'Ver',
    },
    es: {
      title: 'Contratos pendientes de firma',
      messageSingular: 'Tiene 1 contrato para firmar. Complételo para activar su préstamo.',
      messagePlural: 'Tiene {count} contratos para firmar. Complételos para activar sus préstamos.',
      buttonLabel: 'Ver',
    },
    it: {
      title: 'Contratti in attesa di firma',
      messageSingular: 'Hai 1 contratto da firmare. Completalo per attivare il tuo prestito.',
      messagePlural: 'Hai {count} contratti da firmare. Completali per attivare i tuoi prestiti.',
      buttonLabel: 'Visualizza',
    },
    nl: {
      title: 'Contracten wachten op ondertekening',
      messageSingular: 'U hebt 1 contract te ondertekenen. Voltooi het om uw lening te activeren.',
      messagePlural: 'U hebt {count} contracten te ondertekenen. Voltooi ze om uw leningen te activeren.',
      buttonLabel: 'Bekijken',
    },
  };
  return translations[language.toLowerCase()] || translations.en;
}

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
  const { toast } = useToast();
  const t = useTranslations();
  const { language } = useLanguage();
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboard();
  const { data: repaymentsData, isLoading: isRepaymentsLoading } = useUpcomingRepaymentsChart();
  const { data: user } = useUser();
  const { data: stats } = useUserStats();
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  
  const mockCashflowData = getMockCashflowData(t);

  // Get contracts awaiting user signature
  const contractsToSign = dashboardData?.loans?.filter(
    (loan: any) => loan.status === 'approved' && 
    loan.contractStatus === 'awaiting_user_signature' &&
    loan.contractUrl
  ) || [];

  // Get current language for translations (using current app language, not user preference from DB)
  const contractNotif = getContractsNotificationText(language);
  
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
                    <p><strong>Erreur:</strong> {dashboardError ? String(dashboardError) : t.dashboard?.noDataReceived || "Aucune donnée reçue"}</p>
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
    <div className="bg-background min-h-screen">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8 max-w-[1600px] mx-auto animate-fade-in w-full overflow-x-hidden">
        {/* Contracts Notification Banner */}
        {contractsToSign.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10 border border-blue-200 dark:border-blue-900/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full" data-testid="banner-pending-contracts">
            <div className="flex items-start gap-4">
              <PremiumIcon icon={FileSignature} variant="info" size="sm" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1" data-testid="text-contracts-title">
                  {contractNotif.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground" data-testid="text-contracts-message">
                  {contractsToSign.length === 1 
                    ? contractNotif.messageSingular
                    : contractNotif.messagePlural.replace('{count}', String(contractsToSign.length))
                  }
                </p>
              </div>
            </div>
            <Link href="/contracts">
              <Button 
                size="sm" 
                className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white gap-2"
                data-testid="button-view-pending-contracts"
              >
                <Eye className="w-4 h-4" />
                <span>{contractNotif.buttonLabel}</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Hero Section - Greeting with KYC Status */}
        <div className="space-y-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {getGreeting()}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t.dashboard.financeOverview}
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-2 flex-wrap">
              {stats && (
                <Badge 
                  variant="outline"
                  className="text-xs whitespace-nowrap uppercase tracking-wide font-semibold"
                  data-testid="badge-tier-status"
                >
                  {stats.tier === 'gold' && t.dashboard.tierGold}
                  {stats.tier === 'silver' && t.dashboard.tierSilver}
                  {stats.tier === 'bronze' && t.dashboard.tierBronze}
                </Badge>
              )}
              <Badge 
                variant={user.kycStatus === 'verified' ? 'default' : user.kycStatus === 'pending' ? 'secondary' : 'destructive'}
                className="text-xs whitespace-nowrap flex items-center gap-1.5"
                data-testid="badge-kyc-status"
              >
                {user.kycStatus === 'verified' && <Check className="w-3.5 h-3.5" />}
                {user.kycStatus === 'pending' && <Clock className="w-3.5 h-3.5" />}
                {user.kycStatus === 'rejected' && <AlertCircle className="w-3.5 h-3.5" />}
                {user.kycStatus !== 'verified' && user.kycStatus !== 'pending' && user.kycStatus !== 'rejected' && <HelpCircle className="w-3.5 h-3.5" />}
                <span>KYC: {user.kycStatus === 'verified' ? 'Verified' : user.kycStatus === 'pending' ? 'Pending' : user.kycStatus === 'rejected' ? 'Rejected' : 'Not submitted'}</span>
              </Badge>
            </div>
          )}
        </div>


        {/* Tier Status & Active Loans Card */}
        {stats && (
          <DashboardCard className="bg-gradient-to-br from-accent/10 via-background to-background border-accent/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tier Info */}
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {t.dashboard.tierLabel}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {stats.tier === 'gold' && <Star className="w-8 h-8 fill-yellow-500 text-yellow-500" />}
                    {stats.tier === 'silver' && <Sparkles className="w-8 h-8 text-gray-400" />}
                    {stats.tier === 'bronze' && <Circle className="w-8 h-8 fill-orange-600 text-orange-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {stats.tier === 'gold' && t.dashboard.tierGold}
                      {stats.tier === 'silver' && t.dashboard.tierSilver}
                      {stats.tier === 'bronze' && t.dashboard.tierBronze}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {stats.completedLoans} {stats.completedLoans !== 1 ? t.dashboard.completedLoansPlural : t.dashboard.completedLoansSingular}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Loans Counter */}
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {t.dashboard.activeLoansLabel}
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-bold">{stats.activeLoans}/{stats.maxActiveLoans}</span>
                    <span className="text-xs text-muted-foreground">
                      {stats.maxActiveLoans - stats.activeLoans} {t.dashboard.availableLoans}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500 rounded-full"
                      style={{ width: `${(stats.activeLoans / stats.maxActiveLoans) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        )}

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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6" data-testid="section-balance-kpis">
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
            <div className="h-20 sm:h-24 md:h-32 w-full lg:w-96 flex items-end" data-testid="chart-balance-trend">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full">
          <Link href="/transfer/new">
            <Button size="sm" className="gap-1 sm:gap-2 shadow-md w-full text-xs sm:text-sm" data-testid="button-new-transfer">
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{t.dashboard.newTransfer}</span>
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1 sm:gap-2 w-full text-xs sm:text-sm" 
            onClick={() => setLoanModalOpen(true)}
            data-testid="button-request-loan"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t.dashboard.requestLoan}</span>
          </Button>
          <Link href="/accounts">
            <Button size="sm" variant="outline" className="gap-1 sm:gap-2 w-full text-xs sm:text-sm" data-testid="button-manage-accounts">
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{t.dashboard.manageAccounts}</span>
            </Button>
          </Link>
        </div>

        {/* Alerts Section - Upcoming Payments */}
        {dashboardData.loans.some(loan => {
          if (!loan.nextPaymentDate) return false;
          const daysUntilPayment = Math.ceil((new Date(loan.nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilPayment > 0 && daysUntilPayment <= 7;
        }) && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-50/50 dark:from-orange-950/20 dark:to-orange-950/10 border border-orange-200 dark:border-orange-900/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full" data-testid="banner-upcoming-payment">
            <div className="flex items-start gap-4">
              <PremiumIcon icon={Clock} variant="warning" size="sm" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1" data-testid="text-payment-alert">
                  {t.dashboard.upcomingPaymentAlert}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t.dashboard.upcomingPaymentAlertDesc}
                </p>
              </div>
            </div>
            <Link href="/loans">
              <Button 
                size="sm" 
                className="whitespace-nowrap bg-orange-600 hover:bg-orange-700 text-white gap-2"
                data-testid="button-view-payments"
              >
                <Clock className="w-4 h-4" />
                <span>Details</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
          {/* Cashflow Chart - Stripe Style */}
          <DashboardCard 
            title={t.dashboard.cashflow}
            subtitle={t.dashboard.incomeExpensesSixMonths}
            className="lg:col-span-2"
          >
            <div className="h-48 sm:h-60 md:h-72 lg:h-80" data-testid="chart-cashflow">
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

        {/* Monthly Summary Section */}
        <DashboardCard
          title={t.dashboard.monthSummary}
          subtitle={t.dashboard.monthSummaryDesc}
          icon={TrendingUp}
          iconColor="text-primary"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">{t.dashboard.monthlyInterest}</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-monthly-interest">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                  Number(dashboardData.fees
                    .filter(f => f.createdAt && new Date(f.createdAt).getMonth() === new Date().getMonth())
                    .filter(f => f.feeType.toLowerCase().includes('interest') || f.feeType.toLowerCase().includes('intérêt'))
                    .reduce((sum, f) => sum + parseFloat(f.amount), 0))
                )}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">{t.dashboard.monthlyFees}</p>
              <p className="text-2xl font-bold text-destructive" data-testid="text-monthly-fees">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                  Number(dashboardData.fees
                    .filter(f => f.createdAt && new Date(f.createdAt).getMonth() === new Date().getMonth())
                    .reduce((sum, f) => sum + parseFloat(f.amount), 0))
                )}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">{t.dashboard.monthlyCredit}</p>
              <p className="text-2xl font-bold text-accent" data-testid="text-monthly-credit">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(creditUtilization * dashboardData.borrowingCapacity.maxCapacity / 100)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">{t.dashboard.monthlyRepayment}</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-monthly-repayment">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                  Number(dashboardData.loans.reduce((sum, loan) => sum + parseFloat(loan.totalRepaid), 0))
                )}
              </p>
            </div>
          </div>
        </DashboardCard>

        {/* Loans & Repayments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
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
                          <p className="font-semibold text-foreground" data-testid={`text-loan-reference-${loan.id}`}>
                            {loan.loanReference}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {loan.interestRate}% APR
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                            {loan.status}
                          </Badge>
                          {loan.status === 'active' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`button-download-amortization-${loan.id}`}
                              title="Télécharger tableau d'amortissement"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                  const response = await fetch(`/api/loans/${loan.id}/download-amortization?lang=${language}`, { 
                                    method: 'GET',
                                    credentials: 'include',
                                    headers: {
                                      'Accept': 'application/pdf'
                                    }
                                  });
                                  
                                  if (!response.ok) {
                                    const text = await response.text();
                                    throw new Error(`Erreur ${response.status}: ${text}`);
                                  }
                                  
                                  const blob = await response.blob();
                                  if (blob.size === 0) {
                                    throw new Error('Le PDF généré est vide');
                                  }
                                  
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `tableau-amortissement-${loan.loanReference || loan.id}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Erreur téléchargement amortissement:', error);
                                  toast({
                                    title: 'Erreur',
                                    description: `Impossible de télécharger le tableau d'amortissement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
                                    variant: 'destructive'
                                  });
                                }
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.dashboard.amount}</span>
                          <span className="font-semibold">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(loan.amount))}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.dashboard.duration}</span>
                          <span className="font-semibold">{loan.duration} {t.dashboard.months}</span>
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
              <div className="h-48 sm:h-60 md:h-64 mt-3 sm:mt-4" data-testid="chart-upcoming-repayments">
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
