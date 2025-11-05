import BalanceOverview from '@/components/BalanceOverview';
import ActiveLoans from '@/components/ActiveLoans';
import BorrowingCapacity from '@/components/BorrowingCapacity';
import QuickActions from '@/components/QuickActions';
import FeeSection from '@/components/FeeSection';
import PendingTransfers from '@/components/PendingTransfers';
import AvailableFundsChart from '@/components/AvailableFundsChart';
import UpcomingRepaymentsChart from '@/components/UpcomingRepaymentsChart';
import NotificationsBox from '@/components/NotificationsBox';
import WelcomeMessage from '@/components/WelcomeMessage';
import BankCardOffer from '@/components/BankCardOffer';
import { useTranslations } from '@/lib/i18n';
import { useDashboard, useAvailableFundsChart, useUpcomingRepaymentsChart } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const t = useTranslations();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();
  const { data: fundsData, isLoading: isFundsLoading } = useAvailableFundsChart();
  const { data: repaymentsData, isLoading: isRepaymentsLoading } = useUpcomingRepaymentsChart();
  const { data: user } = useUser();
  
  const getGreeting = () => {
    if (user) {
      const firstName = user.fullName.split(' ')[0];
      return `${t.dashboard.welcome}, ${firstName}`;
    }
    return t.dashboard.welcome;
  };

  if (isDashboardLoading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-destructive">Erreur lors du chargement des données</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <WelcomeMessage />
      <div className="p-4 md:p-6 space-y-4">
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-semibold mb-1" data-testid="text-welcome">{getGreeting()} 👋</h1>
          <p className="text-sm text-muted-foreground">Votre solde global : <span className="font-semibold text-foreground">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(dashboardData.balance.currentBalance)}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <BalanceOverview
            currentBalance={dashboardData.balance.currentBalance}
            activeLoansCount={dashboardData.balance.activeLoansCount}
            totalBorrowed={dashboardData.balance.totalBorrowed}
            availableCredit={dashboardData.balance.availableCredit}
            lastUpdated={dashboardData.balance.lastUpdated}
          />
          
          <ActiveLoans loans={dashboardData.loans} />
          
          <PendingTransfers transfers={dashboardData.transfers} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <BorrowingCapacity
            maxCapacity={dashboardData.borrowingCapacity.maxCapacity}
            currentCapacity={dashboardData.borrowingCapacity.currentCapacity}
          />
          
          {isRepaymentsLoading ? (
            <Skeleton className="h-64" />
          ) : repaymentsData ? (
            <UpcomingRepaymentsChart data={repaymentsData} />
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <NotificationsBox />
          <QuickActions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <FeeSection fees={dashboardData.fees} />
          {isFundsLoading ? (
            <Skeleton className="h-64" />
          ) : fundsData ? (
            <AvailableFundsChart data={fundsData} />
          ) : null}
        </div>

        <BankCardOffer />
      </div>
    </div>
  );
}
