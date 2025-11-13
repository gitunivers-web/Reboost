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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Trash2, Trash } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { AdminLayout } from "@/components/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminLoans() {
  const t = useTranslations();
  const { toast } = useToast();
  const [approveReason, setApproveReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteReason, setBulkDeleteReason] = useState("");
  const [selectedLoans, setSelectedLoans] = useState<Set<string>>(new Set());

  const { data: loans, isLoading } = useQuery({
    queryKey: ["/api/admin/loans"],
  });

  const interpolate = (template: string, values: Record<string, string>) => {
    return template.replace(/{(\w+)}/g, (match, key) => values[key] || match);
  };

  const approveLoanMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiRequest("POST", `/api/admin/loans/${id}/approve`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      toast({
        title: t.admin.loans.loanApproved,
        description: t.admin.loans.loanApprovedDesc,
      });
      setApproveReason("");
    },
    onError: (error: any) => {
      toast({
        title: t.admin.common.messages.error,
        description: error.message || t.admin.common.messages.cannotApprove,
        variant: "destructive",
      });
    },
  });

  const rejectLoanMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiRequest("POST", `/api/admin/loans/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      toast({
        title: t.admin.loans.loanRejected,
        description: t.admin.loans.loanRejectedDesc,
      });
      setRejectReason("");
    },
    onError: (error: any) => {
      toast({
        title: t.admin.common.messages.error,
        description: error.message || t.admin.common.messages.cannotReject,
        variant: "destructive",
      });
    },
  });

  const confirmContractMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/loans/${id}/confirm-contract`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      toast({
        title: "Contrat confirmé - Fonds disponibles",
        description: "Le contrat a été confirmé, les codes de transfert ont été générés et les fonds sont désormais disponibles pour l'utilisateur.",
      });
    },
    onError: (error: any) => {
      toast({
        title: t.admin.common.messages.error,
        description: error.message || "Impossible de confirmer le contrat",
        variant: "destructive",
      });
    },
  });

  const deleteLoanMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiRequest("DELETE", `/api/admin/loans/${id}`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      toast({
        title: t.admin.loans.loanDeleted,
        description: t.admin.loans.loanDeletedDesc,
      });
      setDeleteReason("");
    },
    onError: (error: any) => {
      toast({
        title: t.admin.common.messages.error,
        description: error.message || t.admin.common.messages.cannotDelete,
        variant: "destructive",
      });
    },
  });

  const bulkDeleteLoanMutation = useMutation({
    mutationFn: async ({ loanIds, reason }: { loanIds: string[]; reason: string }) => {
      return await apiRequest("POST", "/api/admin/loans/bulk-delete", { loanIds, reason });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      setSelectedLoans(new Set());
      setBulkDeleteReason("");
      setBulkDeleteDialogOpen(false);
      toast({
        title: "Suppression réussie",
        description: data.message || "Les prêts ont été supprimés avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: t.admin.common.messages.error,
        description: error?.message || "Impossible de supprimer les prêts",
        variant: "destructive",
      });
    },
  });

  const toggleLoanSelection = (loanId: string) => {
    const newSelection = new Set(selectedLoans);
    if (newSelection.has(loanId)) {
      newSelection.delete(loanId);
    } else {
      newSelection.add(loanId);
    }
    setSelectedLoans(newSelection);
  };

  const toggleSelectAll = () => {
    const loanList = Array.isArray(loans) ? loans : [];
    if (selectedLoans.size === loanList.length) {
      setSelectedLoans(new Set());
    } else {
      setSelectedLoans(new Set(loanList.map((loan: any) => loan.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedLoans.size === 0) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner au moins un prêt à supprimer",
        variant: "destructive",
      });
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = () => {
    if (!bulkDeleteReason.trim() || bulkDeleteReason.length < 5) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une justification (minimum 5 caractères)",
        variant: "destructive",
      });
      return;
    }
    bulkDeleteLoanMutation.mutate({ 
      loanIds: Array.from(selectedLoans),
      reason: bulkDeleteReason 
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'approved':
        return 'secondary';
      case 'pending_review':
      case 'pending':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending_review': t.admin.common.status.pending,
      'pending': t.admin.common.status.pending,
      'approved': t.admin.common.status.approved,
      'active': t.admin.common.status.active,
      'rejected': t.admin.common.status.rejected,
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <AdminLayout
        title={t.admin.loans.title}
        description={t.admin.loans.description}
      >
        <div className="space-y-6" data-testid="loading-admin-loans">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t.admin.loans.title}
      description={t.admin.loans.description}
    >
      <div className="space-y-6" data-testid="page-admin-loans">
        <Card data-testid="card-loans-table">
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">{t.admin.loans.allLoans}</CardTitle>
              <CardDescription className="text-sm">{t.admin.loans.allLoansDescription}</CardDescription>
            </div>
            {selectedLoans.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoanMutation.isPending}
                data-testid="button-bulk-delete-loans"
              >
                <Trash className="h-4 w-4 mr-2" />
                Supprimer ({selectedLoans.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {Array.isArray(loans) && loans.map((loan: any) => (
              <Card key={loan.id} className="p-4" data-testid={`card-loan-mobile-${loan.id}`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{loan.userName}</p>
                      <p className="text-sm text-muted-foreground">{loan.loanType}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(loan.status)}>
                      {getStatusText(loan.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">{t.admin.common.labels.amount}</p>
                      <p className="font-medium">{parseFloat(loan.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t.admin.common.labels.rate}</p>
                      <p className="font-medium">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t.admin.common.labels.duration}</p>
                      <p className="font-medium">{loan.duration} {t.admin.common.labels.months}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{t.admin.common.labels.contract}</p>
                      <p className="font-medium text-xs">
                        {loan.signedContractUrl ? t.admin.loans.contractSigned : loan.contractUrl ? t.admin.loans.contractGenerated : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t">
                    {(loan.status === 'pending_review' || loan.status === 'pending') && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              data-testid={`button-approve-mobile-${loan.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {t.admin.common.actions.approve}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.admin.loans.approveDialogDesc}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {interpolate(t.admin.loans.approveDialogDesc, {
                                  amount: parseFloat(loan.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
                                  userName: loan.userName
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor={`approve-reason-mobile-${loan.id}`}>{t.admin.loans.approveReason}</Label>
                                <Textarea
                                  id={`approve-reason-mobile-${loan.id}`}
                                  value={approveReason}
                                  onChange={(e) => setApproveReason(e.target.value)}
                                  placeholder={t.admin.loans.approveReason}
                                  data-testid={`input-approve-reason-mobile-${loan.id}`}
                                />
                              </div>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setApproveReason("")}>{t.admin.common.actions.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => approveLoanMutation.mutate({ id: loan.id, reason: approveReason })}
                                disabled={!approveReason || approveLoanMutation.isPending}
                                data-testid={`button-confirm-approve-mobile-${loan.id}`}
                              >
                                {t.admin.common.actions.approve}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              data-testid={`button-reject-mobile-${loan.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {t.admin.common.actions.reject}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.admin.loans.rejectDialogTitle}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.admin.loans.rejectDialogDesc}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor={`reject-reason-mobile-${loan.id}`}>{t.admin.loans.rejectReason}</Label>
                                <Textarea
                                  id={`reject-reason-mobile-${loan.id}`}
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder={t.admin.loans.rejectReason}
                                  data-testid={`input-reject-reason-mobile-${loan.id}`}
                                />
                              </div>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setRejectReason("")}>{t.admin.common.actions.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => rejectLoanMutation.mutate({ id: loan.id, reason: rejectReason })}
                                disabled={!rejectReason || rejectLoanMutation.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-testid={`button-confirm-reject-mobile-${loan.id}`}
                              >
                                {t.admin.common.actions.reject}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    {(loan as any).contractStatus === 'awaiting_admin_review' && loan.signedContractUrl && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full justify-start"
                            data-testid={`button-confirm-contract-mobile-${loan.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirmer le contrat
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer le contrat signé</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action va confirmer le contrat signé par {loan.userName} et générer automatiquement 5 codes de validation de transfert. Les fonds seront ensuite prêts pour le déblocage.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t.admin.common.actions.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => confirmContractMutation.mutate(loan.id)}
                              disabled={confirmContractMutation.isPending}
                              data-testid={`button-confirm-confirm-contract-mobile-${loan.id}`}
                            >
                              Confirmer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-destructive"
                          data-testid={`button-delete-mobile-${loan.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t.admin.common.actions.delete}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.admin.loans.deleteDialogTitle}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.admin.loans.deleteDialogDesc}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`delete-reason-mobile-${loan.id}`}>{t.admin.loans.deleteReason}</Label>
                            <Input
                              id={`delete-reason-mobile-${loan.id}`}
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                              placeholder={t.admin.loans.deleteReason}
                              data-testid={`input-delete-reason-mobile-${loan.id}`}
                            />
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteReason("")}>{t.admin.common.actions.cancel}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteLoanMutation.mutate({ id: loan.id, reason: deleteReason })}
                            disabled={!deleteReason || deleteLoanMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid={`button-confirm-delete-mobile-${loan.id}`}
                          >
                            {t.admin.common.actions.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={Array.isArray(loans) && selectedLoans.size === loans.length && loans.length > 0}
                    onCheckedChange={toggleSelectAll}
                    data-testid="checkbox-select-all-loans"
                  />
                </TableHead>
                <TableHead>{t.admin.common.labels.user}</TableHead>
                <TableHead>{t.admin.common.labels.type}</TableHead>
                <TableHead>{t.admin.common.labels.amount}</TableHead>
                <TableHead>{t.admin.common.labels.rate}</TableHead>
                <TableHead>{t.admin.common.labels.duration}</TableHead>
                <TableHead>{t.admin.common.labels.status}</TableHead>
                <TableHead>{t.admin.common.labels.contract}</TableHead>
                <TableHead className="text-right">{t.admin.common.labels.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(loans) && loans.map((loan: any) => (
                <TableRow key={loan.id} data-testid={`row-loan-${loan.id}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLoans.has(loan.id)}
                      onCheckedChange={() => toggleLoanSelection(loan.id)}
                      data-testid={`checkbox-select-loan-${loan.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium" data-testid={`text-loan-user-${loan.id}`}>
                    {loan.userName}
                  </TableCell>
                  <TableCell data-testid={`text-loan-type-${loan.id}`}>{loan.loanType}</TableCell>
                  <TableCell data-testid={`text-loan-amount-${loan.id}`}>
                    {parseFloat(loan.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </TableCell>
                  <TableCell data-testid={`text-loan-rate-${loan.id}`}>{loan.interestRate}%</TableCell>
                  <TableCell data-testid={`text-loan-duration-${loan.id}`}>{loan.duration} {t.admin.common.labels.months}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(loan.status)}
                      data-testid={`badge-loan-status-${loan.id}`}
                    >
                      {getStatusText(loan.status)}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-loan-contract-${loan.id}`}>
                    {loan.signedContractUrl ? t.admin.loans.contractSigned : loan.contractUrl ? t.admin.loans.contractGenerated : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {(loan.status === 'pending_review' || loan.status === 'pending') && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                data-testid={`button-approve-${loan.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {t.admin.common.actions.approve}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t.admin.loans.approveDialogTitle}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {interpolate(t.admin.loans.approveDialogDesc, {
                                    amount: parseFloat(loan.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
                                    userName: loan.userName
                                  })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`approve-reason-${loan.id}`}>{t.admin.loans.approveReason}</Label>
                                  <Textarea
                                    id={`approve-reason-${loan.id}`}
                                    value={approveReason}
                                    onChange={(e) => setApproveReason(e.target.value)}
                                    placeholder={t.admin.loans.approveReason}
                                    data-testid={`input-approve-reason-${loan.id}`}
                                  />
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setApproveReason("")}>{t.admin.common.actions.cancel}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => approveLoanMutation.mutate({ id: loan.id, reason: approveReason })}
                                  disabled={!approveReason || approveLoanMutation.isPending}
                                  data-testid={`button-confirm-approve-${loan.id}`}
                                >
                                  {t.admin.common.actions.approve}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                data-testid={`button-reject-${loan.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {t.admin.common.actions.reject}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t.admin.loans.rejectDialogTitle}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t.admin.loans.rejectDialogDesc}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`reject-reason-${loan.id}`}>{t.admin.loans.rejectReason}</Label>
                                  <Textarea
                                    id={`reject-reason-${loan.id}`}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder={t.admin.loans.rejectReason}
                                    data-testid={`input-reject-reason-${loan.id}`}
                                  />
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setRejectReason("")}>{t.admin.common.actions.cancel}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => rejectLoanMutation.mutate({ id: loan.id, reason: rejectReason })}
                                  disabled={!rejectReason || rejectLoanMutation.isPending}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-testid={`button-confirm-reject-${loan.id}`}
                                >
                                  {t.admin.common.actions.reject}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}

                      {(loan as any).contractStatus === 'awaiting_admin_review' && loan.signedContractUrl && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              data-testid={`button-confirm-contract-${loan.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer le contrat signé</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action va confirmer le contrat signé par {loan.userName} et générer automatiquement 5 codes de validation de transfert. Les fonds seront ensuite prêts pour le déblocage.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.admin.common.actions.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => confirmContractMutation.mutate(loan.id)}
                                disabled={confirmContractMutation.isPending}
                                data-testid={`button-confirm-confirm-contract-${loan.id}`}
                              >
                                Confirmer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-delete-${loan.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t.admin.loans.deleteDialogTitle}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t.admin.loans.deleteDialogDesc}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor={`delete-reason-${loan.id}`}>{t.admin.loans.deleteReason}</Label>
                              <Input
                                id={`delete-reason-${loan.id}`}
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder={t.admin.loans.deleteReason}
                                data-testid={`input-delete-reason-${loan.id}`}
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteReason("")}>{t.admin.common.actions.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteLoanMutation.mutate({ id: loan.id, reason: deleteReason })}
                              disabled={!deleteReason || deleteLoanMutation.isPending}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-testid={`button-confirm-delete-${loan.id}`}
                            >
                              {t.admin.common.actions.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent data-testid="dialog-bulk-delete-loans">
          <DialogHeader>
            <DialogTitle>Supprimer {selectedLoans.size} prêt(s)</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Veuillez fournir une justification pour cette suppression en masse.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-delete-reason-loans">Justification de suppression *</Label>
              <Textarea
                id="bulk-delete-reason-loans"
                placeholder="Ex: Prêts annulés, frauduleux, doublons, etc."
                value={bulkDeleteReason}
                onChange={(e) => setBulkDeleteReason(e.target.value)}
                rows={4}
                data-testid="input-bulk-delete-reason-loans"
              />
              <p className="text-sm text-muted-foreground">Minimum 5 caractères</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkDeleteDialogOpen(false);
                setBulkDeleteReason("");
              }}
              data-testid="button-cancel-bulk-delete-loans"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDeleteConfirm}
              disabled={bulkDeleteLoanMutation.isPending || !bulkDeleteReason.trim() || bulkDeleteReason.length < 5}
              data-testid="button-confirm-bulk-delete-loans"
            >
              Supprimer {selectedLoans.size} prêt(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
