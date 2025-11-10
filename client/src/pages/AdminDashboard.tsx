import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowRightLeft, DollarSign, Activity } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { AdminLayout, AdminSummaryGrid, type AdminSummaryMetric } from "@/components/admin";

export default function AdminDashboard() {
  const t = useTranslations();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: transfers, isLoading: transfersLoading } = useQuery({
    queryKey: ["/api/admin/transfers"],
  });

  const isLoading = statsLoading || usersLoading || transfersLoading;

  const pendingUsers = Array.isArray(users) ? users.filter((u: any) => u.status === 'pending').length : 0;
  const totalVolume = Array.isArray(transfers) ? transfers.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) : 0;

  const summaryMetrics: AdminSummaryMetric[] = [
    {
      id: 'total-users',
      label: t.admin.dashboard.totalUsers,
      value: (stats as any)?.totalUsers || 0,
      icon: Users,
      description: `${(stats as any)?.activeUsers || 0} ${t.admin.dashboard.activeUsers}, ${pendingUsers} ${t.admin.dashboard.pendingUsers}`,
    },
    {
      id: 'total-transfers',
      label: t.admin.dashboard.transfers,
      value: (stats as any)?.totalTransfers || 0,
      icon: ArrowRightLeft,
      description: `${(stats as any)?.pendingTransfers || 0} ${t.admin.dashboard.transfersPending}`,
    },
    {
      id: 'total-loans',
      label: t.admin.dashboard.loans,
      value: (stats as any)?.totalLoans || 0,
      icon: DollarSign,
      description: `${(stats as any)?.activeLoans || 0} ${t.admin.dashboard.loansActive}`,
    },
    {
      id: 'total-volume',
      label: t.admin.dashboard.totalVolume,
      value: totalVolume.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
      icon: Activity,
      description: t.admin.dashboard.volumeDescription,
    },
  ];

  return (
    <AdminLayout
      title={t.admin.dashboard.title}
      description={t.admin.dashboard.description}
      breadcrumbs={[
        { id: 'admin', label: 'Administration', href: '/admin' },
        { id: 'dashboard', label: t.admin.dashboard.title },
      ]}
    >
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" data-testid="loading-admin-dashboard">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AdminSummaryGrid metrics={summaryMetrics} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-recent-users">
          <CardHeader>
            <CardTitle>{t.admin.dashboard.recentUsers}</CardTitle>
            <CardDescription>{t.admin.dashboard.recentUsersDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(users) && users.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between gap-3" data-testid={`row-user-${user.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" data-testid={`text-user-name-${user.id}`}>{user.fullName}</p>
                    <p className="text-sm text-muted-foreground truncate" data-testid={`text-user-email-${user.id}`}>{user.email}</p>
                  </div>
                  <Badge
                    variant={user.status === 'active' ? 'default' : 'secondary'}
                    data-testid={`badge-user-status-${user.id}`}
                  >
                    {user.status === 'active' ? t.admin.common.status.active : t.admin.common.status.pending}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-transfers">
          <CardHeader>
            <CardTitle>{t.admin.dashboard.recentTransfers}</CardTitle>
            <CardDescription>{t.admin.dashboard.recentTransfersDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(transfers) && transfers.slice(0, 5).map((transfer: any) => (
                <div key={transfer.id} className="flex items-center justify-between gap-3" data-testid={`row-transfer-${transfer.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" data-testid={`text-transfer-recipient-${transfer.id}`}>{transfer.recipient}</p>
                    <p className="text-sm text-muted-foreground truncate" data-testid={`text-transfer-user-${transfer.id}`}>{transfer.userName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium mb-1" data-testid={`text-transfer-amount-${transfer.id}`}>
                      {parseFloat(transfer.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                    <Badge
                      variant={
                        transfer.status === 'completed' ? 'default' : 
                        transfer.status === 'in-progress' ? 'secondary' :
                        transfer.status === 'suspended' ? 'destructive' :
                        'outline'
                      }
                      data-testid={`badge-transfer-status-${transfer.id}`}
                    >
                      {transfer.status === 'completed' ? t.admin.common.status.completed : 
                       transfer.status === 'in-progress' ? t.admin.common.status.inProgress :
                       transfer.status === 'suspended' ? t.admin.common.status.suspended :
                       t.admin.common.status.pending}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
