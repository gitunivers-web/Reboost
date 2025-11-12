import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ban, Trash2, CheckCircle, Trash } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminUsers() {
  const { toast } = useToast();
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const suspendUserMutation = useMutation({
    mutationFn: async ({ id, until, reason }: { id: string; until: string; reason: string }) => {
      return await apiRequest("POST", `/api/admin/users/${id}/suspend`, { until, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utilisateur suspendu",
        description: "L'utilisateur a été suspendu avec succès",
      });
      setSuspendDialogOpen(false);
      setSuspendReason("");
      setSuspendUntil("");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de suspendre l'utilisateur",
        variant: "destructive",
      });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/users/${id}/unblock`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utilisateur activé",
        description: "L'utilisateur a été activé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'activer l'utilisateur",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteUserMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      return await apiRequest("POST", "/api/admin/users/bulk-delete", { userIds });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUsers(new Set());
      toast({
        title: "Suppression réussie",
        description: data.message || "Les utilisateurs ont été supprimés avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de supprimer les utilisateurs",
        variant: "destructive",
      });
    },
  });

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = () => {
    const userList = Array.isArray(users) ? users : [];
    if (selectedUsers.size === userList.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(userList.map((user: any) => user.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner au moins un utilisateur à supprimer",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.size} utilisateur(s) ?`)) {
      bulkDeleteUserMutation.mutate(Array.from(selectedUsers));
    }
  };

  const handleSuspend = (userId: string) => {
    setSelectedUserId(userId);
    setSuspendDialogOpen(true);
  };

  const handleSuspendConfirm = () => {
    if (!suspendReason || !suspendUntil) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    suspendUserMutation.mutate({ 
      id: selectedUserId, 
      until: new Date(suspendUntil).toISOString(), 
      reason: suspendReason 
    });
  };

  const handleActivate = (userId: string) => {
    unblockUserMutation.mutate(userId);
  };

  const handleDelete = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  if (isLoading) {
    return (
      <AdminLayout
        title="Gestion des Utilisateurs"
        description="Gérer tous les comptes utilisateurs de la plateforme"
      >
        <div className="space-y-6" data-testid="loading-admin-users">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent data-testid="dialog-suspend-user">
          <DialogHeader>
            <DialogTitle>Suspendre l'utilisateur</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la durée et la raison de la suspension
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspendUntil">Suspendre jusqu'au</Label>
              <Input
                id="suspendUntil"
                type="datetime-local"
                value={suspendUntil}
                onChange={(e) => setSuspendUntil(e.target.value)}
                data-testid="input-suspend-until"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspendReason">Raison</Label>
              <Textarea
                id="suspendReason"
                placeholder="Indiquez la raison de la suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                data-testid="textarea-suspend-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspendDialogOpen(false)}
              data-testid="button-cancel-suspend"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSuspendConfirm}
              disabled={suspendUserMutation.isPending}
              data-testid="button-confirm-suspend"
            >
              {suspendUserMutation.isPending ? "Suspension..." : "Suspendre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminLayout
        title="Gestion des Utilisateurs"
        description="Gérer tous les comptes utilisateurs de la plateforme"
      >
        <div className="space-y-6" data-testid="page-admin-users">
          <Card data-testid="card-users-table">
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <CardTitle>Tous les Utilisateurs</CardTitle>
                <CardDescription>Liste complète des comptes utilisateurs</CardDescription>
              </div>
              {selectedUsers.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteUserMutation.isPending}
                  data-testid="button-bulk-delete-users"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Supprimer ({selectedUsers.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={Array.isArray(users) && selectedUsers.size === users.length && users.length > 0}
                      onCheckedChange={toggleSelectAll}
                      data-testid="checkbox-select-all-users"
                    />
                  </TableHead>
                  <TableHead>Nom Complet</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Solde</TableHead>
                  <TableHead>Prêts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(users) && users.map((user: any) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                        data-testid={`checkbox-select-user-${user.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-user-name-${user.id}`}>
                      {user.fullName}
                    </TableCell>
                    <TableCell data-testid={`text-user-email-${user.id}`}>{user.email}</TableCell>
                    <TableCell data-testid={`text-user-phone-${user.id}`}>{user.phone || '-'}</TableCell>
                    <TableCell data-testid={`text-user-type-${user.id}`}>{user.accountType}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === 'active' ? 'default' :
                          user.status === 'suspended' ? 'destructive' : 'secondary'
                        }
                        data-testid={`badge-user-status-${user.id}`}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.kycStatus === 'approved' ? 'default' : 'secondary'}
                        data-testid={`badge-user-kyc-${user.id}`}
                      >
                        {user.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-user-balance-${user.id}`}>
                      {user.balance?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '0 €'}
                    </TableCell>
                    <TableCell data-testid={`text-user-loans-${user.id}`}>{user.loansCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspend(user.id)}
                            disabled={suspendUserMutation.isPending || unblockUserMutation.isPending}
                            data-testid={`button-suspend-${user.id}`}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Suspendre
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivate(user.id)}
                            disabled={suspendUserMutation.isPending || unblockUserMutation.isPending}
                            data-testid={`button-activate-${user.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activer
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleteUserMutation.isPending}
                              data-testid={`button-delete-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Cela supprimera définitivement le compte de{' '}
                                <strong>{user.fullName}</strong> et toutes ses données associées.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid={`button-cancel-delete-${user.id}`}>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-testid={`button-confirm-delete-${user.id}`}
                              >
                                Supprimer
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
          </CardContent>
        </Card>
        </div>
      </AdminLayout>
    </>
  );
}
