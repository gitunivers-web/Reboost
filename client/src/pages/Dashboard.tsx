import { useTranslations } from '@/lib/i18n';
import { useDashboard, useUpcomingRepaymentsChart } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const t = useTranslations();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();
  const { data: repaymentsData, isLoading: isRepaymentsLoading } = useUpcomingRepaymentsChart();
  const { data: user } = useUser();
  
  if (isDashboardLoading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-destructive">{t.dashboard.dataLoadError}</p>
      </div>
    );
  }

  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const activeLoans = dashboardData.loans.filter(l => l.status === 'active' || l.status === 'approved').length;
  const completedLoans = dashboardData.loans.filter(l => l.status === 'completed' || l.status === 'closed').length;
  const pendingTransfers = dashboardData.transfers.filter(t => t.status === 'pending').length;
  
  const chartData = repaymentsData?.map((item: any) => ({
    month: item.month,
    amount: Number(item.amount) / 1000
  })) || [];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">
          Bienvenue, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Votre solde global : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(dashboardData.balance.currentBalance)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Solde actuel</h3>
                  <p className="text-4xl font-bold text-foreground" data-testid="text-current-balance">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(dashboardData.balance.currentBalance)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Il y a 5 minutes</p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prêts actifs</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-active-loans">
                      {activeLoans}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prêts résompits</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-completed-loans">
                      {completedLoans}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Remboursements à venir</h3>
              <div className="h-64" data-testid="chart-upcoming-repayments">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => value.substring(0, 3)}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${value}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `${value.toFixed(1)}k €`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Transferts en attente</h3>
                {pendingTransfers > 0 ? (
                  <p className="text-sm text-muted-foreground">{pendingTransfers} transfert(s) en attente</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun transfert trouvé</p>
                )}
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">100% disponible</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Capacité d'emprunt</h3>
                <p className="text-3xl font-bold text-foreground" data-testid="text-borrowing-capacity">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(dashboardData.borrowingCapacity.currentCapacity)}
                </p>
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">100% disponible</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Card className="bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0] text-white border-0 shadow-lg">
            <CardContent className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold">ALTUS</p>
                    <p className="text-xs opacity-90">FINANCE GROUP</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-mono tracking-wider">
                  1234 5679 9012 3456
                </p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs opacity-75 mb-1">Titulaire</p>
                  <p className="text-sm font-semibold tracking-wide uppercase">
                    {user?.fullName || 'LOUIS TAVARES'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75 mb-1">Expire</p>
                  <p className="text-sm font-semibold">12/28</p>
                </div>
              </div>

              <Button 
                variant="secondary" 
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                data-testid="button-view-card-details"
              >
                Voir les détails
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
