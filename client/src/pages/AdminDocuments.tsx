import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Download, Trash2, Eye, FileText, Filter } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface KycDocument {
  id: string;
  userId: string;
  loanId: string | null;
  documentType: string;
  loanType: string;
  status: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  reviewedAt: string | null;
  reviewerId: string | null;
  reviewNotes: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export default function AdminDocuments() {
  const { toast } = useToast();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KycDocument | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: documents, isLoading } = useQuery<KycDocument[]>({
    queryKey: ["/api/admin/kyc/documents"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PUT", `/api/admin/kyc/documents/${id}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/documents"] });
      toast({
        title: "Document approuvé",
        description: "Le document a été approuvé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'approuver le document",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return await apiRequest("PUT", `/api/admin/kyc/documents/${id}/reject`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/documents"] });
      toast({
        title: "Document rejeté",
        description: "Le document a été rejeté",
      });
      setRejectDialogOpen(false);
      setRejectNotes("");
      setSelectedDocument(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de rejeter le document",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/kyc/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/documents"] });
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de supprimer le document",
        variant: "destructive",
      });
    },
  });

  const handleRejectConfirm = () => {
    if (!selectedDocument || !rejectNotes.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une raison pour le rejet",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ id: selectedDocument.id, notes: rejectNotes });
  };

  const handleDownload = async (doc: KycDocument) => {
    try {
      window.open(`/api/kyc/download/${doc.id}`, '_blank');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (doc: KycDocument) => {
    setSelectedDocument(doc);
    setPreviewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 dark:bg-green-600" data-testid={`badge-status-approved`}>Approuvé</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 dark:bg-red-600" data-testid={`badge-status-rejected`}>Rejeté</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 dark:bg-yellow-600" data-testid={`badge-status-pending`}>En attente</Badge>;
      default:
        return <Badge data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredDocuments = documents?.filter(doc => 
    statusFilter === "all" || doc.status === statusFilter
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">Chargement des documents...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            Gestion des Documents KYC
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérer les documents d'identité et justificatifs envoyés par les utilisateurs
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle data-testid="text-documents-count">Documents KYC ({filteredDocuments.length})</CardTitle>
              <CardDescription>Liste de tous les documents uploadés par les utilisateurs</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-documents">
                Aucun document trouvé
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type de document</TableHead>
                    <TableHead>Type de prêt</TableHead>
                    <TableHead>Nom du fichier</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Date d'upload</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id} data-testid={`row-document-${doc.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white" data-testid={`text-user-name-${doc.id}`}>
                            {doc.user.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400" data-testid={`text-user-email-${doc.id}`}>
                            {doc.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-document-type-${doc.id}`}>{doc.documentType}</TableCell>
                      <TableCell data-testid={`text-loan-type-${doc.id}`}>{doc.loanType}</TableCell>
                      <TableCell className="max-w-xs truncate" data-testid={`text-file-name-${doc.id}`}>
                        {doc.fileName}
                      </TableCell>
                      <TableCell data-testid={`text-file-size-${doc.id}`}>{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell data-testid={`text-upload-date-${doc.id}`}>
                        {format(new Date(doc.uploadedAt), "dd MMM yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(doc)}
                            data-testid={`button-preview-${doc.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            data-testid={`button-download-${doc.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {doc.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approveMutation.mutate(doc.id)}
                                disabled={approveMutation.isPending}
                                className="text-green-600 hover:text-green-700 dark:text-green-400"
                                data-testid={`button-approve-${doc.id}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setRejectDialogOpen(true);
                                }}
                                disabled={rejectMutation.isPending}
                                className="text-red-600 hover:text-red-700 dark:text-red-400"
                                data-testid={`button-reject-${doc.id}`}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
                                deleteMutation.mutate(doc.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                            data-testid={`button-delete-${doc.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent data-testid="dialog-reject-document">
          <DialogHeader>
            <DialogTitle>Rejeter le document</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet de ce document. Cette information sera visible par l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-notes">Raison du rejet</Label>
              <Textarea
                id="reject-notes"
                placeholder="Ex: Document illisible, informations manquantes, etc."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={4}
                data-testid="input-reject-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectNotes("");
                setSelectedDocument(null);
              }}
              data-testid="button-cancel-reject"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending || !rejectNotes.trim()}
              data-testid="button-confirm-reject"
            >
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl" data-testid="dialog-preview-document">
          <DialogHeader>
            <DialogTitle>Aperçu du document</DialogTitle>
            <DialogDescription>
              {selectedDocument && (
                <div className="space-y-2">
                  <p><strong>Utilisateur:</strong> {selectedDocument.user.fullName} ({selectedDocument.user.email})</p>
                  <p><strong>Type:</strong> {selectedDocument.documentType}</p>
                  <p><strong>Fichier:</strong> {selectedDocument.fileName}</p>
                  <p><strong>Taille:</strong> {formatFileSize(selectedDocument.fileSize)}</p>
                  <p><strong>Statut:</strong> {getStatusBadge(selectedDocument.status)}</p>
                  {selectedDocument.reviewedAt && (
                    <p><strong>Examiné le:</strong> {format(new Date(selectedDocument.reviewedAt), "dd MMM yyyy HH:mm", { locale: fr })}</p>
                  )}
                  {selectedDocument.reviewNotes && (
                    <p><strong>Notes:</strong> {selectedDocument.reviewNotes}</p>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedDocument && (
              <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 min-h-[400px] flex items-center justify-center">
                {selectedDocument.fileName.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={`/api/kyc/download/${selectedDocument.id}`}
                    className="w-full h-[600px]"
                    title="Document preview"
                  />
                ) : (
                  <img
                    src={`/api/kyc/download/${selectedDocument.id}`}
                    alt={selectedDocument.fileName}
                    className="max-w-full max-h-[600px] object-contain"
                  />
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewDialogOpen(false)}
              data-testid="button-close-preview"
            >
              Fermer
            </Button>
            {selectedDocument && (
              <Button
                onClick={() => handleDownload(selectedDocument)}
                data-testid="button-download-from-preview"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
