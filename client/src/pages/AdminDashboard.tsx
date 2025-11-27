import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, ArrowRightLeft, DollarSign, Activity, FileCheck, FileSignature, ShieldCheck, MessageSquare, Bell, AlertCircle, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import AdminLayout from "@/components/admin/AdminLayout";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function AdminDashboard() {
  const t = useTranslations();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showClearNotifications, setShowClearNotifications] = useState(false);
  const [showResetStatistics, setShowResetStatistics] = useState(false);
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: transfers, isLoading: transfersLoading } = useQuery({
    queryKey: ["/api/admin/transfers"],
  });

  const { data: notificationCounts, isLoading: notificationsLoading } = useQuery<{
    pendingLoans: number;
    signedContracts: number;
    transfersRequiringCode: number;
    unreadMessages: number;
    total: number;
  }>({
    queryKey: ["/api/admin/notifications-count"],
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const isLoading = statsLoading || usersLoading || transfersLoading;

  const pendingUsers = Array.isArray(users) ? users.filter((u: any) => u.status === 'pending').length : 0;
  const totalVolume = Array.isArray(transfers) ? transfers.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) : 0;

  const hasNotifications = (notificationCounts?.total || 0) > 0;

  const clearNotificationsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/clear-notifications-dashboard", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications-count"] });
      setShowClearNotifications(false);
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été supprimées",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la suppression des notifications",
        variant: "destructive",
      });
    },
  });

  const resetStatisticsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/reset-statistics-dashboard", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setShowResetStatistics(false);
      toast({
        title: "Succès",
        description: "Les statistiques ont été réinitialisées",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la réinitialisation",
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout title={t.admin.dashboard.title}>
      {/* Actions Urgentes - Cartes d'Alertes */}
      {!notificationsLoading && hasNotifications && (
        <div className="mb-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-gray-900">{t.admin.dashboard.actionsRequired}</h2>
              <Badge variant="destructive" className="ml-2">
                {notificationCounts?.total}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearNotifications(true)}
              disabled={clearNotificationsMutation.isPending}
              className="flex gap-2 items-center"
              data-testid="button-clear-notifications"
            >
              <Trash2 className="w-4 h-4" />
              Effacer
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Demandes de prêts en attente */}
            {(notificationCounts?.pendingLoans || 0) > 0 && (
              <Card 
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 hover-elevate active-elevate-2 cursor-pointer transition-all"
                onClick={() => setLocation('/admin/loans')}
                data-testid="card-alert-pending-loans"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <FileCheck className="w-8 h-8 text-blue-600" />
                    <Badge variant="default" className="bg-blue-600">
                      {notificationCounts?.pendingLoans}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg font-semibold text-blue-900 mb-1">
                    {t.admin.dashboard.pendingLoansAlert}
                  </CardTitle>
                  <p className="text-sm text-blue-700">
                    {notificationCounts?.pendingLoans === 1 
                      ? t.admin.dashboard.pendingLoansDescOne 
                      : t.admin.dashboard.pendingLoansDescMany.replace('{count}', String(notificationCounts?.pendingLoans))}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contrats signés */}
            {(notificationCounts?.signedContracts || 0) > 0 && (
              <Card 
                className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 hover-elevate active-elevate-2 cursor-pointer transition-all"
                onClick={() => setLocation('/admin/loans')}
                data-testid="card-alert-signed-contracts"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <FileSignature className="w-8 h-8 text-emerald-600" />
                    <Badge variant="default" className="bg-emerald-600">
                      {notificationCounts?.signedContracts}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg font-semibold text-emerald-900 mb-1">
                    {t.admin.dashboard.signedContractsAlert}
                  </CardTitle>
                  <p className="text-sm text-emerald-700">
                    {notificationCounts?.signedContracts === 1
                      ? t.admin.dashboard.signedContractsDescOne
                      : t.admin.dashboard.signedContractsDescMany.replace('{count}', String(notificationCounts?.signedContracts))}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Codes de transfert requis */}
            {(notificationCounts?.transfersRequiringCode || 0) > 0 && (
              <Card 
                className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 hover-elevate active-elevate-2 cursor-pointer transition-all"
                onClick={() => setLocation('/admin/loans')}
                data-testid="card-alert-transfer-codes"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <ShieldCheck className="w-8 h-8 text-amber-600" />
                    <Badge variant="default" className="bg-amber-600">
                      {notificationCounts?.transfersRequiringCode}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg font-semibold text-amber-900 mb-1">
                    {t.admin.dashboard.transferCodesAlert}
                  </CardTitle>
                  <p className="text-sm text-amber-700">
                    {notificationCounts?.transfersRequiringCode === 1
                      ? t.admin.dashboard.transferCodesDescOne
                      : t.admin.dashboard.transferCodesDescMany.replace('{count}', String(notificationCounts?.transfersRequiringCode))}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Messages non lus */}
            {(notificationCounts?.unreadMessages || 0) > 0 && (
              <Card 
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 hover-elevate active-elevate-2 cursor-pointer transition-all"
                onClick={() => setLocation('/admin/chat')}
                data-testid="card-alert-unread-messages"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                    <Badge variant="default" className="bg-purple-600">
                      {notificationCounts?.unreadMessages}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg font-semibold text-purple-900 mb-1">
                    {t.admin.dashboard.unreadMessagesAlert}
                  </CardTitle>
                  <p className="text-sm text-purple-700">
                    {notificationCounts?.unreadMessages === 1
                      ? t.admin.dashboard.unreadMessagesDescOne
                      : t.admin.dashboard.unreadMessagesDescMany.replace('{count}', String(notificationCounts?.unreadMessages))}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {notificationsLoading && (
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gray-50">
                <CardHeader className="pb-3">
                  <Skeleton className="h-8 w-8" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Management Buttons */}
      <div className="mb-6 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResetStatistics(true)}
          disabled={resetStatisticsMutation.isPending}
          className="flex gap-2 items-center"
          data-testid="button-reset-statistics"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser les statistiques
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="bg-white rounded-2xl shadow-sm border border-gray-200" data-testid="card-total-users">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-700">{t.admin.dashboard.totalUsers}</CardTitle>
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-indigo-600 mt-2" data-testid="text-total-users">
                  {(stats as any)?.totalUsers || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(stats as any)?.activeUsers || 0} {t.admin.dashboard.activeUsers}, {pendingUsers} {t.admin.dashboard.pendingUsers}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border border-gray-200" data-testid="card-total-transfers">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-700">{t.admin.dashboard.transfers}</CardTitle>
                  <ArrowRightLeft className="w-8 h-8 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-indigo-600 mt-2" data-testid="text-total-transfers">
                  {(stats as any)?.totalTransfers || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(stats as any)?.pendingTransfers || 0} {t.admin.dashboard.transfersPending}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border border-gray-200" data-testid="card-total-loans">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-700">{t.admin.dashboard.loans}</CardTitle>
                  <DollarSign className="w-8 h-8 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-indigo-600 mt-2" data-testid="text-total-loans">
                  {(stats as any)?.totalLoans || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(stats as any)?.activeLoans || 0} {t.admin.dashboard.loansActive}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border border-gray-200" data-testid="card-total-volume">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-700">{t.admin.dashboard.totalVolume}</CardTitle>
                  <Activity className="w-8 h-8 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-indigo-600 mt-2" data-testid="text-total-volume">
                  {totalVolume.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-gray-500 mt-1">{t.admin.dashboard.volumeDescription}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200" data-testid="card-recent-users">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">{t.admin.dashboard.recentUsers}</CardTitle>
            <CardDescription className="text-sm text-gray-500">{t.admin.dashboard.recentUsersDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(users) && users.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors" data-testid={`row-user-${user.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-900" data-testid={`text-user-name-${user.id}`}>{user.fullName}</p>
                    <p className="text-sm text-gray-500 truncate" data-testid={`text-user-email-${user.id}`}>{user.email}</p>
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

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200" data-testid="card-recent-transfers">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">{t.admin.dashboard.recentTransfers}</CardTitle>
            <CardDescription className="text-sm text-gray-500">{t.admin.dashboard.recentTransfersDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(transfers) && transfers.slice(0, 5).map((transfer: any) => (
                <div key={transfer.id} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors" data-testid={`row-transfer-${transfer.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-900" data-testid={`text-transfer-recipient-${transfer.id}`}>{transfer.recipient}</p>
                    <p className="text-sm text-gray-500 truncate" data-testid={`text-transfer-user-${transfer.id}`}>{transfer.userName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium mb-1 text-gray-900" data-testid={`text-transfer-amount-${transfer.id}`}>
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

      {/* Clear Notifications Dialog */}
      <AlertDialog open={showClearNotifications} onOpenChange={setShowClearNotifications}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Effacer toutes les notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer toutes les notifications ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel data-testid="button-cancel-clear-notifications">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearNotificationsMutation.mutate()}
              disabled={clearNotificationsMutation.isPending}
              data-testid="button-confirm-clear-notifications"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearNotificationsMutation.isPending ? t.admin?.common?.messages?.deleting || "Suppression..." : t.admin?.common?.actions?.delete || "Supprimer"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Statistics Dialog */}
      <AlertDialog open={showResetStatistics} onOpenChange={setShowResetStatistics}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser les statistiques</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir réinitialiser les statistiques du tableau de bord ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel data-testid="button-cancel-reset-statistics">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetStatisticsMutation.mutate()}
              disabled={resetStatisticsMutation.isPending}
              data-testid="button-confirm-reset-statistics"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {resetStatisticsMutation.isPending ? t.admin?.common?.messages?.resetting || "Réinitialisation..." : t.admin?.common?.actions?.reset || "Réinitialiser"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
