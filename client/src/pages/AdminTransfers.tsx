import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle, Ban } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/lib/i18n";

export default function AdminTransfers() {
  const t = useTranslations();
  const { toast } = useToast();
  const { data: transfers, isLoading } = useQuery({
    queryKey: ["/api/admin/transfers"],
  });

  const updateTransferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/transfers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: t.admin.transfers.transferUpdated,
        description: t.admin.transfers.transferUpdatedDesc,
      });
    },
    onError: () => {
      toast({
        title: t.admin.common.messages.error,
        description: t.admin.common.messages.cannotUpdate,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (transferId: string) => {
    updateTransferMutation.mutate({
      id: transferId,
      data: { status: "in-progress", approvedAt: new Date() },
    });
  };

  const handleSuspend = (transferId: string) => {
    updateTransferMutation.mutate({
      id: transferId,
      data: { status: "suspended", suspendedAt: new Date() },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6" data-testid="loading-admin-transfers">
        <div className="h-8 w-64 bg-muted animate-pulse rounded mb-6" />
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6" data-testid="page-admin-transfers">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-page-title">{t.admin.transfers.title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground" data-testid="text-page-description">
          {t.admin.transfers.description}
        </p>
      </div>

      <Card data-testid="card-transfers-table">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{t.admin.transfers.allTransfers}</CardTitle>
          <CardDescription className="text-sm">{t.admin.transfers.allTransfersDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {Array.isArray(transfers) && transfers.map((transfer: any) => (
              <Card key={transfer.id} className="p-4" data-testid={`card-transfer-mobile-${transfer.id}`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{transfer.userName}</p>
                      <p className="text-sm text-muted-foreground">{transfer.userEmail}</p>
                    </div>
                    <Badge
                      variant={
                        transfer.status === 'completed' ? 'default' :
                        transfer.status === 'in-progress' ? 'secondary' :
                        transfer.status === 'suspended' ? 'destructive' :
                        'outline'
                      }
                    >
                      {transfer.status === 'completed' ? t.admin.common.status.completed :
                       transfer.status === 'in-progress' ? t.admin.common.status.inProgress :
                       transfer.status === 'suspended' ? t.admin.common.status.suspended :
                       t.admin.common.status.pending}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">{t.admin.common.labels.recipient}</p>
                      <p className="font-medium">{transfer.recipient}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t.admin.common.labels.amount}</p>
                      <p className="font-medium">{parseFloat(transfer.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t.admin.common.labels.fees}</p>
                      <p className="font-medium">{parseFloat(transfer.feeAmount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t.admin.common.labels.date}</p>
                      <p className="font-medium">{new Date(transfer.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${transfer.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-sm">{transfer.progressPercent}%</span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {t.admin.common.labels.codes}: {transfer.codesValidated}/{transfer.requiredCodes}
                  </p>

                  {(transfer.status === 'pending' || transfer.status === 'in-progress') && (
                    <div className="flex flex-col gap-2 pt-2 border-t">
                      {transfer.status === 'pending' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              data-testid={`button-approve-mobile-${transfer.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {t.admin.common.actions.approve}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.admin.transfers.approveDialogTitle}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.admin.transfers.approveDialogDesc}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.admin.common.actions.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => updateTransferMutation.mutate({ id: transfer.id, data: { status: 'in-progress' } })}
                                disabled={updateTransferMutation.isPending}
                                data-testid={`button-confirm-approve-mobile-${transfer.id}`}
                              >
                                {t.admin.common.actions.approve}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full justify-start"
                            data-testid={`button-suspend-mobile-${transfer.id}`}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            {t.admin.common.actions.suspend}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t.admin.transfers.suspendDialogTitle}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t.admin.transfers.suspendDialogDesc}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t.admin.common.actions.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => updateTransferMutation.mutate({ id: transfer.id, data: { status: 'suspended' } })}
                              disabled={updateTransferMutation.isPending}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-testid={`button-confirm-suspend-mobile-${transfer.id}`}
                            >
                              {t.admin.common.actions.suspend}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.common.labels.user}</TableHead>
                <TableHead>{t.admin.common.labels.recipient}</TableHead>
                <TableHead>{t.admin.common.labels.amount}</TableHead>
                <TableHead>{t.admin.common.labels.fees}</TableHead>
                <TableHead>{t.admin.common.labels.status}</TableHead>
                <TableHead>{t.admin.common.labels.progress}</TableHead>
                <TableHead>{t.admin.common.labels.codes}</TableHead>
                <TableHead>{t.admin.common.labels.date}</TableHead>
                <TableHead className="text-right">{t.admin.common.labels.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(transfers) && transfers.map((transfer: any) => (
                <TableRow key={transfer.id} data-testid={`row-transfer-${transfer.id}`}>
                  <TableCell data-testid={`text-transfer-user-${transfer.id}`}>
                    <div>
                      <div className="font-medium">{transfer.userName}</div>
                      <div className="text-sm text-muted-foreground">{transfer.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium" data-testid={`text-transfer-recipient-${transfer.id}`}>
                    {transfer.recipient}
                  </TableCell>
                  <TableCell data-testid={`text-transfer-amount-${transfer.id}`}>
                    {parseFloat(transfer.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </TableCell>
                  <TableCell data-testid={`text-transfer-fee-${transfer.id}`}>
                    {parseFloat(transfer.feeAmount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell data-testid={`text-transfer-progress-${transfer.id}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${transfer.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-sm">{transfer.progressPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell data-testid={`text-transfer-codes-${transfer.id}`}>
                    {transfer.codesValidated}/{transfer.requiredCodes}
                  </TableCell>
                  <TableCell data-testid={`text-transfer-date-${transfer.id}`}>
                    {new Date(transfer.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {transfer.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(transfer.id)}
                          disabled={updateTransferMutation.isPending}
                          data-testid={`button-approve-${transfer.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t.admin.common.actions.approve}
                        </Button>
                      )}
                      {(transfer.status === 'pending' || transfer.status === 'in-progress') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleSuspend(transfer.id)}
                          disabled={updateTransferMutation.isPending}
                          data-testid={`button-suspend-${transfer.id}`}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          {t.admin.common.actions.suspend}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
