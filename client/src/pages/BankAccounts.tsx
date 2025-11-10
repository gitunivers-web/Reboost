import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, CreditCard, Trash2, Star } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import type { ExternalAccount } from '@shared/schema';
import { useTranslations } from '@/lib/i18n';

function BankAccountsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-48" />
      ))}
    </div>
  );
}

export default function BankAccounts() {
  const t = useTranslations();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    iban: '',
    bic: '',
    accountLabel: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: accounts, isLoading } = useQuery<ExternalAccount[]>({
    queryKey: ['/api/external-accounts'],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/external-accounts', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-accounts'] });
      toast({
        title: t.bankAccounts.addSuccess,
        description: t.bankAccounts.addSuccessDesc,
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: t.common.error,
        description: t.bankAccounts.addError,
        variant: 'destructive',
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/external-accounts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-accounts'] });
      toast({
        title: t.bankAccounts.deleteSuccess,
        description: t.bankAccounts.deleteSuccessDesc,
      });
    },
    onError: () => {
      toast({
        title: t.common.error,
        description: t.bankAccounts.deleteError,
        variant: 'destructive',
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = t.bankAccounts.bankNameRequired;
    }

    if (!formData.iban.trim()) {
      newErrors.iban = t.bankAccounts.ibanRequired;
    } else if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(formData.iban.replace(/\s/g, ''))) {
      newErrors.iban = t.bankAccounts.invalidIban;
    }

    if (formData.bic && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(formData.bic.replace(/\s/g, ''))) {
      newErrors.bic = t.bankAccounts.invalidBic;
    }

    if (!formData.accountLabel.trim()) {
      newErrors.accountLabel = t.bankAccounts.accountLabelRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createAccountMutation.mutate({
        ...formData,
        iban: formData.iban.replace(/\s/g, '').toUpperCase(),
        bic: formData.bic.replace(/\s/g, '').toUpperCase(),
      });
    }
  };

  const resetForm = () => {
    setFormData({ bankName: '', iban: '', bic: '', accountLabel: '' });
    setErrors({});
  };

  const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <BankAccountsSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.bankAccounts.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.bankAccounts.description}</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2"
            data-testid="button-add-account"
          >
            <Plus className="w-4 h-4" />
            {t.bankAccounts.addAccount}
          </Button>
        </div>

        {accounts && accounts.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t.bankAccounts.noAccountsTitle}</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-md">
                {t.bankAccounts.noAccountsDescription}
              </p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-account">
                <Plus className="mr-2 h-4 w-4" />
                {t.bankAccounts.addFirstAccount}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts?.map((account) => (
              <Card key={account.id} className="p-6 relative" data-testid={`card-account-${account.id}`}>
                {account.isDefault && (
                  <Badge className="absolute top-4 right-4 gap-1" variant="default">
                    <Star className="w-3 h-3" />
                    Par défaut
                  </Badge>
                )}
                
                <div className="space-y-4">
                  {/* Bank Icon & Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">{account.bankName}</h3>
                      <p className="text-sm text-muted-foreground">{account.accountLabel}</p>
                    </div>
                  </div>

                  {/* IBAN */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">IBAN</p>
                    <p className="font-mono text-sm text-foreground">
                      {formatIBAN(account.iban)}
                    </p>
                  </div>

                  {/* BIC */}
                  {account.bic && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">BIC/SWIFT</p>
                      <p className="font-mono text-sm text-foreground">{account.bic}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAccountMutation.mutate(account.id)}
                      disabled={deleteAccountMutation.isPending}
                      data-testid={`button-delete-account-${account.id}`}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.bankAccounts.addAccountTitle}</DialogTitle>
            <DialogDescription>
              {t.bankAccounts.addAccountDescription}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountLabel">{t.bankAccounts.accountLabel}</Label>
              <Input
                id="accountLabel"
                value={formData.accountLabel}
                onChange={(e) => setFormData({ ...formData, accountLabel: e.target.value })}
                placeholder={t.bankAccounts.accountLabelPlaceholder}
                data-testid="input-account-label"
              />
              {errors.accountLabel && (
                <p className="text-sm text-destructive">{errors.accountLabel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">{t.bankAccounts.bankName}</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder={t.bankAccounts.bankNamePlaceholder}
                data-testid="input-bank-name"
              />
              {errors.bankName && (
                <p className="text-sm text-destructive">{errors.bankName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">{t.bankAccounts.iban}</Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                data-testid="input-iban"
              />
              {errors.iban && (
                <p className="text-sm text-destructive">{errors.iban}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bic">{t.bankAccounts.bic} (Optionnel)</Label>
              <Input
                id="bic"
                value={formData.bic}
                onChange={(e) => setFormData({ ...formData, bic: e.target.value.toUpperCase() })}
                placeholder="BNPAFRPP"
                data-testid="input-bic"
              />
              {errors.bic && (
                <p className="text-sm text-destructive">{errors.bic}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                data-testid="button-cancel-add-account"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={createAccountMutation.isPending}
                data-testid="button-submit-add-account"
              >
                {createAccountMutation.isPending ? t.common.saving : t.common.save}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
