import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { UserLayout } from '@/components/UserLayout';

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
      <UserLayout
        title={t.bankAccounts.title}
        description={t.bankAccounts.description}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </UserLayout>
    );
  }

  return (
    <>
      <UserLayout
        title={t.bankAccounts.title}
        description={t.bankAccounts.description}
        actions={
          <Button
            size="lg"
            onClick={() => setDialogOpen(true)}
            data-testid="button-add-account"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t.bankAccounts.addAccount}
          </Button>
        }
      >

        {accounts && accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.bankAccounts.noAccountsTitle}</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {t.bankAccounts.noAccountsDescription}
              </p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-account">
                <Plus className="mr-2 h-4 w-4" />
                {t.bankAccounts.addFirstAccount}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts?.map((account) => (
              <Card key={account.id} className="relative" data-testid={`card-account-${account.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{account.bankName}</CardTitle>
                    </div>
                    {account.isDefault && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Défaut
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="font-semibold">{account.accountLabel}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>IBAN</span>
                    </div>
                    <p className="font-mono text-sm break-all">{formatIBAN(account.iban)}</p>
                  </div>
                  
                  {account.bic && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">BIC</p>
                      <p className="font-mono text-sm">{account.bic}</p>
                    </div>
                  )}

                  <div className="pt-3 flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
                          deleteAccountMutation.mutate(account.id);
                        }
                      }}
                      data-testid={`button-delete-account-${account.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.bankAccounts.delete}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </UserLayout>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t.bankAccounts.addAccount} bancaire</DialogTitle>
            <DialogDescription>
              {t.bankAccounts.addAccountDescription}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="accountLabel">{t.bankAccounts.accountLabelLabel}</Label>
              <Input
                id="accountLabel"
                placeholder="{t.bankAccounts.accountLabelPlaceholder}"
                value={formData.accountLabel}
                onChange={(e) => {
                  setFormData({ ...formData, accountLabel: e.target.value });
                  setErrors({ ...errors, accountLabel: '' });
                }}
                className={errors.accountLabel ? 'border-destructive' : ''}
                data-testid="input-account-label"
              />
              {errors.accountLabel && (
                <p className="text-sm text-destructive">{errors.accountLabel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">{t.bankAccounts.bankNameLabel}</Label>
              <Input
                id="bankName"
                placeholder="{t.bankAccounts.bankNamePlaceholder}"
                value={formData.bankName}
                onChange={(e) => {
                  setFormData({ ...formData, bankName: e.target.value });
                  setErrors({ ...errors, bankName: '' });
                }}
                className={errors.bankName ? 'border-destructive' : ''}
                data-testid="input-bank-name"
              />
              {errors.bankName && (
                <p className="text-sm text-destructive">{errors.bankName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                value={formData.iban}
                onChange={(e) => {
                  setFormData({ ...formData, iban: e.target.value });
                  setErrors({ ...errors, iban: '' });
                }}
                className={errors.iban ? 'border-destructive' : ''}
                data-testid="input-iban"
              />
              {errors.iban && (
                <p className="text-sm text-destructive">{errors.iban}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bic">{t.bankAccounts.bicLabel}</Label>
              <Input
                id="bic"
                placeholder="AGRIFRPP"
                value={formData.bic}
                onChange={(e) => {
                  setFormData({ ...formData, bic: e.target.value });
                  setErrors({ ...errors, bic: '' });
                }}
                className={errors.bic ? 'border-destructive' : ''}
                data-testid="input-bic"
              />
              {errors.bic && (
                <p className="text-sm text-destructive">{errors.bic}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                data-testid="button-cancel-account"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={createAccountMutation.isPending}
                data-testid="button-submit-account"
              >
                {createAccountMutation.isPending ? '{t.bankAccounts.submitting}' : '{t.bankAccounts.submitting}le compte'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
