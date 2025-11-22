import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Trash2, Star, CreditCard, ShieldCheck, Search, X } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import type { ExternalAccount } from '@shared/schema';
import { useTranslations } from '@/lib/i18n';
import { DashboardCard, SectionTitle, GradientButton } from '@/components/fintech';
import { searchBanks, validateIban, formatIban, type Bank } from '@/data/banks';

function BankAccountsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-2xl" />
      ))}
    </div>
  );
}

export default function BankAccounts() {
  const t = useTranslations();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    bankName: '',
    bankCountry: '',
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

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        const results = searchBanks(searchQuery);
        setSearchResults(results);
        setShowSuggestions(results.length > 0);
      }, 150);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setFormData({
      ...formData,
      bankName: bank.name,
      bankCountry: bank.country,
      bic: bank.bic,
    });
    setSearchQuery('');
    setShowSuggestions(false);
    setErrors({});
  };

  const handleRemoveBank = () => {
    setSelectedBank(null);
    setFormData({
      ...formData,
      bankName: '',
      bankCountry: '',
      bic: '',
    });
    setErrors({});
  };

  const validateForm = (dataToValidate = formData, bankSelection = selectedBank) => {
    const newErrors: Record<string, string> = {};

    if (!dataToValidate.bankName.trim()) {
      newErrors.bankName = t.bankAccounts.bankNameRequired;
    }

    if (!dataToValidate.iban.trim()) {
      newErrors.iban = t.bankAccounts.ibanRequired;
    } else {
      const cleanIban = dataToValidate.iban.replace(/\s/g, '').toUpperCase();
      const countryCode = cleanIban.substring(0, 2);
      
      if (bankSelection && bankSelection.ibanLength > 0) {
        if (!validateIban(cleanIban, bankSelection)) {
          newErrors.iban = t.bankAccounts.invalidIbanLength(bankSelection.countryName, bankSelection.ibanLength, cleanIban.length);
        }
      } else {
        if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIban)) {
          newErrors.iban = t.bankAccounts.invalidIban;
        }
        
        if (dataToValidate.bankCountry && countryCode !== dataToValidate.bankCountry) {
          newErrors.iban = t.bankAccounts.invalidIbanCountryCode(countryCode, dataToValidate.bankCountry);
        }
      }
    }

    if (dataToValidate.bic) {
      const cleanBic = dataToValidate.bic.replace(/\s/g, '').toUpperCase();
      if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanBic)) {
        newErrors.bic = t.bankAccounts.invalidBic;
      }
    }

    if (!dataToValidate.accountLabel.trim()) {
      newErrors.accountLabel = t.bankAccounts.accountLabelRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalBankName = selectedBank ? formData.bankName : (formData.bankName || searchQuery.trim());
    const finalFormData = {
      ...formData,
      bankName: finalBankName,
      iban: formData.iban.replace(/\s/g, '').toUpperCase(),
      bic: formData.bic.replace(/\s/g, '').toUpperCase(),
    };
    
    if (validateForm(finalFormData)) {
      setFormData(finalFormData);
      createAccountMutation.mutate(finalFormData);
    }
  };

  const resetForm = () => {
    setFormData({ bankName: '', bankCountry: '', iban: '', bic: '', accountLabel: '' });
    setErrors({});
    setSelectedBank(null);
    setSearchQuery('');
  };

  const formatIBANDisplay = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleIbanChange = (value: string) => {
    const formatted = formatIban(value);
    const cleanIban = formatted.replace(/\s/g, '').toUpperCase();
    const countryCode = cleanIban.substring(0, 2);
    
    if (!selectedBank && cleanIban.length >= 2 && /^[A-Z]{2}/.test(cleanIban)) {
      setFormData({ 
        ...formData, 
        iban: formatted,
        bankCountry: countryCode
      });
    } else {
      setFormData({ ...formData, iban: formatted });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <BankAccountsSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="bg-background">
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <SectionTitle
              title={t.bankAccounts.title}
              subtitle={t.bankAccounts.description}
            />
            <GradientButton
              variant="primary"
              icon={Plus}
              onClick={() => setDialogOpen(true)}
              data-testid="button-add-account"
            >
              {t.bankAccounts.addAccount}
            </GradientButton>
          </div>

          {accounts && accounts.length === 0 ? (
            <DashboardCard className="bg-muted/20">
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{t.bankAccounts.noAccountsTitle}</h3>
                <p className="text-muted-foreground text-sm mb-8 max-w-md">
                  {t.bankAccounts.noAccountsDescription}
                </p>
                <GradientButton
                  variant="primary"
                  icon={Plus}
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-add-first-account"
                >
                  {t.bankAccounts.addFirstAccount}
                </GradientButton>
              </div>
            </DashboardCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="list-bank-accounts">
              {accounts?.map((account) => (
                <DashboardCard 
                  key={account.id}
                  className={`relative overflow-hidden transition-all duration-200 ${
                    account.isDefault 
                      ? 'border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background' 
                      : 'hover-elevate'
                  }`}
                  testId={`card-account-${account.id}`}
                >
                  {account.isDefault && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-tl-none rounded-br-none rounded-tr-2xl gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary via-primary to-blue-600 shadow-lg">
                        <Star className="w-3 h-3 fill-current" />
                        {t.bankAccounts.defaultBadge}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 pt-2">
                      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-foreground mb-1 truncate">{account.bankName}</h3>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground truncate">{account.accountLabel}</p>
                        </div>
                        {account.bankCountry && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {account.bankCountry}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">IBAN</p>
                      </div>
                      <p className="font-mono text-sm text-foreground font-medium leading-relaxed">
                        {formatIBANDisplay(account.iban)}
                      </p>
                    </div>

                    {account.bic && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">BIC/SWIFT</p>
                        <p className="font-mono text-base text-foreground font-semibold">{account.bic}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border/50 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAccountMutation.mutate(account.id)}
                        disabled={deleteAccountMutation.isPending}
                        data-testid={`button-delete-account-${account.id}`}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleteAccountMutation.isPending ? t.bankAccounts.deleting : t.bankAccounts.delete}
                      </Button>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{t.bankAccounts.addAccountTitle}</DialogTitle>
            <DialogDescription className="text-base">
              {t.bankAccounts.addAccountDescription}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="accountLabel" className="text-sm font-semibold">
                {t.bankAccounts.accountLabel}
              </Label>
              <Input
                id="accountLabel"
                value={formData.accountLabel}
                onChange={(e) => setFormData({ ...formData, accountLabel: e.target.value })}
                placeholder={t.bankAccounts.accountLabelPlaceholder}
                className="border-border/50 focus:border-primary"
                data-testid="input-account-label"
              />
              {errors.accountLabel && (
                <p className="text-sm text-destructive font-medium">{errors.accountLabel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankSearch" className="text-sm font-semibold">
                {t.bankAccounts.bankName}
              </Label>
              
              {selectedBank ? (
                <div className="relative">
                  <DashboardCard className="p-4 bg-muted/30">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{selectedBank.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedBank.countryName} ({selectedBank.country})
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveBank}
                        data-testid="button-remove-bank"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </DashboardCard>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative" ref={suggestionsRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="bankSearch"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.bankAccounts.searchBankPlaceholder}
                        className="pl-10 border-border/50 focus:border-primary"
                        data-testid="input-bank-search"
                        onFocus={() => {
                          if (searchResults.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                      />
                    </div>

                    {showSuggestions && searchResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {searchResults.map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => handleSelectBank(bank)}
                            className="w-full text-left p-3 hover-elevate transition-colors flex items-center gap-3 border-b border-border/30 last:border-0"
                            data-testid={`button-select-bank-${bank.id}`}
                          >
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">{bank.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {bank.countryName} ({bank.country}) • {bank.bic}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 border-t border-border"></div>
                    <span>{t.bankAccounts.orManualEntry}</span>
                    <div className="flex-1 border-t border-border"></div>
                  </div>

                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder={t.bankAccounts.bankNamePlaceholder}
                    className="border-border/50 focus:border-primary"
                    data-testid="input-bank-name-manual"
                  />
                </div>
              )}

              {errors.bankName && (
                <p className="text-sm text-destructive font-medium">{errors.bankName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bic" className="text-sm font-semibold">
                {t.bankAccounts.bic}
                {!selectedBank && <span className="text-muted-foreground font-normal ml-1">{t.bankAccounts.optional}</span>}
              </Label>
              <Input
                id="bic"
                value={formData.bic}
                onChange={(e) => setFormData({ ...formData, bic: e.target.value.toUpperCase() })}
                placeholder="BNPAFRPP"
                className="font-mono border-border/50 focus:border-primary"
                readOnly={!!selectedBank}
                data-testid="input-bic"
              />
              {errors.bic && (
                <p className="text-sm text-destructive font-medium">{errors.bic}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban" className="text-sm font-semibold">
                {t.bankAccounts.iban}
              </Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => handleIbanChange(e.target.value)}
                placeholder={selectedBank && selectedBank.ibanLength > 0 
                  ? `${t.bankAccounts.formatExpected} ${selectedBank.country}: ${selectedBank.ibanLength} ${t.bankAccounts.characters}` 
                  : "FR76 1234 5678 9012 3456 7890 123"}
                className="font-mono border-border/50 focus:border-primary"
                data-testid="input-iban"
              />
              {errors.iban && (
                <p className="text-sm text-destructive font-medium">{errors.iban}</p>
              )}
              {selectedBank && selectedBank.ibanLength > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t.bankAccounts.formatExpected} : {selectedBank.ibanLength} {t.bankAccounts.charactersFor} {selectedBank.countryName}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6">
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
              <GradientButton
                variant="primary"
                type="submit"
                isLoading={createAccountMutation.isPending}
                data-testid="button-submit-add-account"
              >
                {createAccountMutation.isPending ? t.common.saving : t.common.save}
              </GradientButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
