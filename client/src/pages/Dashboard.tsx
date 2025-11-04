import BalanceOverview from '@/components/BalanceOverview';
import ActiveLoans from '@/components/ActiveLoans';
import BorrowingCapacity from '@/components/BorrowingCapacity';
import QuickActions from '@/components/QuickActions';
import FeeSection from '@/components/FeeSection';
import PendingTransfers from '@/components/PendingTransfers';
import AvailableFundsChart from '@/components/AvailableFundsChart';
import UpcomingRepaymentsChart from '@/components/UpcomingRepaymentsChart';
import LoanAmortizationSection from '@/components/LoanAmortizationSection';
import { useTranslations } from '@/lib/i18n';
import { useDashboard, useAvailableFundsChart, useUpcomingRepaymentsChart } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">{t.dashboard.welcome}</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre compte professionnel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BalanceOverview
          currentBalance={dashboardData.balance.currentBalance}
          activeLoansCount={dashboardData.balance.activeLoansCount}
          totalBorrowed={dashboardData.balance.totalBorrowed}
          availableCredit={dashboardData.balance.availableCredit}
          lastUpdated={dashboardData.balance.lastUpdated}
        />
        <BorrowingCapacity
          maxCapacity={dashboardData.borrowingCapacity.maxCapacity}
          currentCapacity={dashboardData.borrowingCapacity.currentCapacity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActiveLoans loans={dashboardData.loans} />
        <QuickActions />
        <FeeSection fees={dashboardData.fees} />
      </div>

      <PendingTransfers transfers={dashboardData.transfers} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isFundsLoading ? (
          <Skeleton className="h-96 lg:col-span-2" />
        ) : fundsData ? (
          <AvailableFundsChart data={fundsData} />
        ) : null}
        
        {isRepaymentsLoading ? (
          <Skeleton className="h-96 lg:col-span-2" />
        ) : repaymentsData ? (
          <UpcomingRepaymentsChart data={repaymentsData} />
        ) : null}
      </div>

      <LoanAmortizationSection loans={dashboardData.loans} />
    </div>
  );
}
