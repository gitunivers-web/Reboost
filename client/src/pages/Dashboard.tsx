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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <WelcomeMessage />
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent" data-testid="text-welcome">{getGreeting()}</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre compte professionnel</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BalanceOverview
              currentBalance={dashboardData.balance.currentBalance}
              activeLoansCount={dashboardData.balance.activeLoansCount}
              totalBorrowed={dashboardData.balance.totalBorrowed}
              availableCredit={dashboardData.balance.availableCredit}
              lastUpdated={dashboardData.balance.lastUpdated}
            />
          </div>
          <BorrowingCapacity
            maxCapacity={dashboardData.borrowingCapacity.maxCapacity}
            currentCapacity={dashboardData.borrowingCapacity.currentCapacity}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotificationsBox />
          <QuickActions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveLoans loans={dashboardData.loans} />
          <FeeSection fees={dashboardData.fees} />
        </div>

        <PendingTransfers transfers={dashboardData.transfers} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isFundsLoading ? (
            <Skeleton className="h-96" />
          ) : fundsData ? (
            <AvailableFundsChart data={fundsData} />
          ) : null}
          
          {isRepaymentsLoading ? (
            <Skeleton className="h-96" />
          ) : repaymentsData ? (
            <UpcomingRepaymentsChart data={repaymentsData} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
