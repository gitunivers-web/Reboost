import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminLayout, AdminSummaryGrid, type AdminSummaryMetric } from "@/components/admin";
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReports() {
  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/audit-logs"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: transfers } = useQuery({
    queryKey: ["/api/admin/transfers"],
  });

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      approve_transfer: "Transfert approuvé",
      suspend_transfer: "Transfert suspendu",
      update_settings: "Paramètres modifiés",
      update_user: "Utilisateur modifié",
      delete_user: "Utilisateur supprimé",
      update_transfer: "Transfert modifié",
    };
    return labels[action] || action;
  };

  const completedTransfers = Array.isArray(transfers) ? transfers.filter((t: any) => t.status === 'completed') : [];
  const totalVolume = completedTransfers.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
  const totalFees = completedTransfers.reduce((sum: number, t: any) => sum + parseFloat(t.feeAmount), 0);
  const activeUsers = (stats as any)?.activeUsers || 0;

  const metrics: AdminSummaryMetric[] = [
    {
      id: "completed-transfers",
      label: "Transferts Complétés",
      value: completedTransfers.length.toString(),
      icon: BarChart3,
    },
    {
      id: "total-volume",
      label: "Volume Total",
      value: totalVolume.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
      icon: TrendingUp,
    },
    {
      id: "total-fees",
      label: "Frais Totaux",
      value: totalFees.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
      icon: DollarSign,
    },
    {
      id: "active-users",
      label: "Utilisateurs Actifs",
      value: activeUsers.toString(),
      icon: Users,
    },
  ];

  if (logsLoading) {
    return (
      <AdminLayout
        title="Rapports et Activités"
        description="Historique des activités et statistiques de la plateforme"
      >
        <div className="space-y-6" data-testid="loading-admin-reports">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Rapports et Activités"
      description="Historique des activités et statistiques de la plateforme"
    >
      <div className="space-y-6" data-testid="page-admin-reports">
        <AdminSummaryGrid metrics={metrics} />

        <Card data-testid="card-audit-logs">
          <CardHeader>
            <CardTitle>Journal d'Audit</CardTitle>
            <CardDescription>
              Historique des actions administratives récentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Administrateur</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(auditLogs) && auditLogs.map((log: any) => (
                    <TableRow key={log.id} data-testid={`row-audit-log-${log.id}`}>
                      <TableCell className="text-sm" data-testid={`text-log-date-${log.id}`}>
                        {new Date(log.createdAt).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-log-action-${log.id}`}>
                        {getActionLabel(log.action)}
                      </TableCell>
                      <TableCell data-testid={`text-log-admin-${log.id}`}>
                        {log.adminName || 'Système'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`text-log-details-${log.id}`}>
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!auditLogs || (Array.isArray(auditLogs) && auditLogs.length === 0)) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        {t.admin?.audit?.noLogs || 'Aucun log d\'audit disponible'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
