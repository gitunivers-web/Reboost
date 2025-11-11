import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { getLoanOffersByAccountType } from '@shared/loan-offers';
import { getRequiredDocuments, calculateInterestRate, getLoanOfferLimits } from '@shared/loan-helpers';
import { Loader2, Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import type { User } from '@shared/schema';

interface LoanRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const loanRequestSchema = z.object({
  loanType: z.string().min(1, 'Veuillez sélectionner un type de prêt'),
  amount: z.number().min(1000),
  duration: z.number().min(1),
});

type LoanRequestForm = z.infer<typeof loanRequestSchema>;

export function LoanRequestModal({ open, onOpenChange, user }: LoanRequestModalProps) {
  const { toast } = useToast();
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, File>>({});
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);

  const accountType = user.accountType === 'business' ? 'business' : 'individual';
  const loanOffers = getLoanOffersByAccountType(accountType);
  const requiredDocuments = getRequiredDocuments(accountType);

  const form = useForm<LoanRequestForm>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: {
      loanType: '',
      amount: 10000,
      duration: 24,
    },
  });

  const loanType = form.watch('loanType');
  const amount = form.watch('amount');
  const duration = form.watch('duration');

  const limits = loanType ? getLoanOfferLimits(loanType, accountType) : null;
  const interestRate = loanType ? calculateInterestRate(loanType, amount, duration, accountType) : 0;

  const monthlyPayment = loanType && amount && duration ? 
    (amount * (1 + interestRate / 100 * duration / 12)) / duration : 0;

  const createLoanMutation = useMutation({
    mutationFn: async (data: LoanRequestForm & { documents: Record<string, string> }) => {
      const response = await apiRequest('POST', '/api/loans', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de prêt a été envoyée avec succès. Vous recevrez une réponse sous 48h.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      onOpenChange(false);
      form.reset();
      setUploadedDocuments({});
      setSelectedLoanType(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'envoi de votre demande.',
        variant: 'destructive',
      });
    },
  });

  const handleFileUpload = async (documentId: string, file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille maximale par fichier est de 10MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedDocuments(prev => ({ ...prev, [documentId]: file }));
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[documentId];
      return newDocs;
    });
  };

  const onSubmit = async (data: LoanRequestForm) => {
    const requiredDocs = requiredDocuments.filter(doc => doc.required);
    const missingDocs = requiredDocs.filter(doc => !uploadedDocuments[doc.id]);

    if (missingDocs.length > 0) {
      toast({
        title: 'Documents manquants',
        description: `Veuillez joindre tous les documents requis: ${missingDocs.map(d => d.label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    const documentUrls: Record<string, string> = {};
    for (const [docId, file] of Object.entries(uploadedDocuments)) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      documentUrls[docId] = base64;
    }

    createLoanMutation.mutate({
      ...data,
      documents: documentUrls,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-loan-request">
        <DialogHeader>
          <DialogTitle>Demander un prêt</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous et joignez les documents requis pour soumettre votre demande de prêt.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de prêt</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedLoanType(value);
                      const newLimits = getLoanOfferLimits(value, accountType);
                      form.setValue('amount', newLimits.minAmount);
                      form.setValue('duration', newLimits.minDuration);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-loan-type">
                        <SelectValue placeholder="Sélectionnez un type de prêt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loanOffers.map((offer) => (
                        <SelectItem key={offer.id} value={offer.id}>
                          {offer.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {limits && (
              <>
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant du prêt</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              min={limits.minAmount}
                              max={limits.maxAmount}
                              step={1000}
                              data-testid="input-loan-amount"
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">€</span>
                          </div>
                          <Slider
                            value={[field.value]}
                            onValueChange={(values: number[]) => field.onChange(values[0])}
                            min={limits.minAmount}
                            max={limits.maxAmount}
                            step={1000}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{limits.minAmount.toLocaleString()}€</span>
                            <span>{limits.maxAmount.toLocaleString()}€</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (mois)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              min={limits.minDuration}
                              max={limits.maxDuration}
                              data-testid="input-loan-duration"
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">mois</span>
                          </div>
                          <Slider
                            value={[field.value]}
                            onValueChange={(values: number[]) => field.onChange(values[0])}
                            min={limits.minDuration}
                            max={limits.maxDuration}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{limits.minDuration} mois</span>
                            <span>{limits.maxDuration} mois</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taux d'intérêt</span>
                    <span className="font-semibold">{interestRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Paiement mensuel estimé</span>
                    <span className="font-semibold text-lg">{monthlyPayment.toFixed(2)}€</span>
                  </div>
                </div>
              </>
            )}

            {selectedLoanType && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Documents requis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Veuillez joindre tous les documents marqués comme requis pour finaliser votre demande.
                  </p>
                </div>

                <div className="space-y-3">
                  {requiredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-3 border rounded-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{doc.label}</span>
                          {doc.required && <Badge variant="destructive" className="h-5 text-xs">Requis</Badge>}
                          {!doc.required && <Badge variant="secondary" className="h-5 text-xs">Optionnel</Badge>}
                        </div>
                        {uploadedDocuments[doc.id] && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>{uploadedDocuments[doc.id].name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {uploadedDocuments[doc.id] ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument(doc.id)}
                            data-testid={`button-remove-${doc.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        ) : (
                          <label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              asChild
                              data-testid={`button-upload-${doc.id}`}
                            >
                              <span className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Joindre
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(doc.id, file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-loan-request"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createLoanMutation.isPending || !selectedLoanType}
                data-testid="button-submit-loan-request"
              >
                {createLoanMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Envoyer la demande
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
