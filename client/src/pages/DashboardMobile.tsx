import { useUser } from '@/hooks/use-user';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTranslations } from '@/lib/i18n';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  ArrowUpRight, 
  Wallet,
  CreditCard,
  TrendingUp,
  Send,
  ArrowRight
} from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import MobileSidebar from '@/components/MobileSidebar';
import { useState } from 'react';

function DashboardMobileSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-background p-4 space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-40 w-full rounded-3xl" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function DashboardMobile() {
  const { data: user } = useUser();
  const { data: dashboardData, isLoading } = useDashboard();
  const t = useTranslations();
  const [hasNotifications] = useState(true);

  if (isLoading) {
    return <DashboardMobileSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] dark:bg-background p-4">
        <p className="text-destructive">{t.dashboard.dataLoadError}</p>
      </div>
    );
  }

  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const creditUtilization = dashboardData.borrowingCapacity.maxCapacity > 0
    ? ((dashboardData.borrowingCapacity.maxCapacity - dashboardData.borrowingCapacity.currentCapacity) / dashboardData.borrowingCapacity.maxCapacity) * 100
    : 0;

  const getInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-background pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-card sticky top-0 z-40 border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <MobileSidebar />
          <div className="flex-1 ml-3">
            <p className="text-sm text-muted-foreground" data-testid="text-welcome">{t.dashboard.welcome}</p>
            <p className="font-semibold text-base text-foreground" data-testid="text-username">{firstName}</p>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {hasNotifications && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse-ring" />
              )}
            </Button>
          </motion.div>
          <Avatar className="w-9 h-9 ml-2 border border-border/50">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="p-4 space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Solde Disponible Card */}
        <motion.div variants={itemVariants}>
          <Card 
            className="bg-gradient-to-br from-[#0046FF] via-[#0052CC] to-[#0040DD] text-white border-0 shadow-md overflow-hidden relative transition-transform duration-300 hover:scale-[1.02]"
            data-testid="card-balance"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-4 h-4" />
                <p className="text-sm opacity-90">Solde disponible</p>
              </div>
              <h2 className="text-4xl font-bold mb-6" data-testid="text-total-balance">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(dashboardData.balance.currentBalance)}
              </h2>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-[#0046FF] hover:bg-white/90 font-semibold shadow-sm"
                  asChild
                >
                  <Link href="/transfer/new" data-testid="button-transfer">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Effectuer un transfert
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats - Crédit disponible & Prêts actifs */}
        <motion.div className="grid grid-cols-2 gap-3" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="bg-white dark:bg-card shadow-md hover:shadow-lg transition-shadow" data-testid="card-available-credit">
              <CardContent className="p-4">
                <div className="bg-[#E6EEFF] dark:bg-primary/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                  <Wallet className="h-6 w-6 text-[#0046FF] dark:text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Crédit disponible</p>
                <p className="text-lg font-semibold text-foreground">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(dashboardData.balance.availableCredit)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="bg-white dark:bg-card shadow-md hover:shadow-lg transition-shadow" data-testid="card-active-loans">
              <CardContent className="p-4">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                  <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Prêts actifs</p>
                <p className="text-lg font-semibold text-foreground">{dashboardData.balance.activeLoansCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(dashboardData.balance.totalBorrowed)} total
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Credit Utilization Card */}
        <motion.div variants={itemVariants}>
          <Card 
            className="bg-gradient-to-br from-[#0046FF] via-[#0052CC] to-[#0040DD] text-white border-0 shadow-md"
            data-testid="card-credit-utilization"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{t.dashboard.creditUtilization}</p>
                  <p className="text-xs opacity-75 mt-1">{t.dashboard.borrowingCapacity}</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - creditUtilization / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{creditUtilization.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="opacity-75">{t.dashboard.used}:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(dashboardData.borrowingCapacity.maxCapacity - dashboardData.borrowingCapacity.currentCapacity)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-75">{t.dashboard.available}:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(dashboardData.borrowingCapacity.currentCapacity)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transfers */}
        {dashboardData.transfers.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground" data-testid="text-recent-transfers">
                {t.dashboard.recentActivity}
              </h3>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary">
                  {t.dashboard.viewAll}
                </Button>
              </Link>
            </div>
            <Card className="bg-white dark:bg-card shadow-md">
              <CardContent className="p-3 space-y-2">
                {dashboardData.transfers.slice(0, 3).map((transfer, index) => (
                  <motion.div
                    key={transfer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-lg hover-elevate bg-[#F8F9FB] dark:bg-muted/30"
                    data-testid={`transfer-item-${transfer.id}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#E6EEFF] dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Send className="h-5 w-5 text-[#0046FF] dark:text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{transfer.recipient}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transfer.updatedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-sm text-foreground">
                        -{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(transfer.amount))}
                      </p>
                      <Badge 
                        variant={
                          transfer.status === 'approved' || transfer.status === 'completed' ? 'default' : 
                          transfer.status === 'pending' || transfer.status === 'in-progress' ? 'secondary' : 
                          'destructive'
                        } 
                        className="text-xs mt-1"
                      >
                        {transfer.status === 'approved' || transfer.status === 'completed' ? t.transfer.approved : 
                         transfer.status === 'pending' ? t.transfer.pending : 
                         transfer.status === 'in-progress' ? t.transfer.inProgress :
                         t.transfer.rejected}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Loans */}
        {dashboardData.loans.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground" data-testid="text-active-loans">
                {t.dashboard.yourActiveLoans}
              </h3>
              <Link href="/loans">
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary">
                  {t.dashboard.viewAll}
                </Button>
              </Link>
            </div>
            <Card className="bg-white dark:bg-card shadow-md">
              <CardContent className="p-3 space-y-2">
                {dashboardData.loans.slice(0, 4).map((loan, index) => {
                  const progress = loan.totalRepaid ? Math.min((Number(loan.totalRepaid) / Number(loan.amount)) * 100, 100) : 0;
                  const icons = [
                    { bg: 'bg-[#E6EEFF] dark:bg-primary/20', icon: <CreditCard className="w-5 h-5 text-[#0046FF] dark:text-primary" /> },
                    { bg: 'bg-green-100 dark:bg-green-900/30', icon: <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" /> },
                    { bg: 'bg-red-100 dark:bg-red-900/30', icon: <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" /> },
                    { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
                  ];
                  const iconData = icons[index % icons.length];

                  return (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="p-3 rounded-lg hover-elevate bg-[#F8F9FB] dark:bg-muted/30"
                      data-testid={`loan-item-${loan.id}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full ${iconData.bg} flex items-center justify-center flex-shrink-0`}>
                            {iconData.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground">{t.dashboard.activeLoan}</p>
                            <p className="text-xs text-muted-foreground">{loan.interestRate}% APR</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-semibold text-sm text-foreground">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(loan.amount))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{t.dashboard.repaid}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                            className="bg-[#0046FF] dark:bg-primary h-1.5 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div className="grid grid-cols-2 gap-3 pt-2" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="w-full shadow-sm" asChild data-testid="button-request-loan">
              <Link href="/loan-request">
                <CreditCard className="w-4 h-4 mr-2" />
                {t.dashboard.requestLoan}
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="w-full shadow-sm" asChild data-testid="button-manage-accounts">
              <Link href="/accounts">
                <Wallet className="w-4 h-4 mr-2" />
                {t.dashboard.manageAccounts}
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Empty States */}
        {dashboardData.transfers.length === 0 && dashboardData.loans.length === 0 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-card shadow-md">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">{t.dashboard.noRecentTransactions}</p>
                <Button asChild>
                  <Link href="/loan-request">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t.dashboard.requestLoan}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
