import { useState, useMemo } from 'react';
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
import { useTranslations, useLanguage } from '@/lib/i18n';
import { getTranslatedLoanOffers } from '@/lib/loan-offer-i18n';

interface LoanRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const createLoanRequestSchema = (validationError: string) => z.object({
  loanType: z.string().min(1, validationError),
  amount: z.number().min(1000),
  duration: z.number().min(1),
});

type LoanRequestForm = z.infer<ReturnType<typeof createLoanRequestSchema>>;

const getDocumentLabels = (language: string) => {
  const labels: Record<string, Record<string, string>> = {
    fr: {
      id_card: "Pièce d'identité valide (CNI, passeport)",
      proof_of_address: "Justificatif de domicile (moins de 3 mois)",
      pay_slips: "3 derniers bulletins de salaire",
      tax_assessment: "Dernier avis d'imposition",
      bank_statements: "Relevés bancaires (3 mois)",
      project_justification: "Justificatifs du projet (devis, factures)",
      kbis: "Kbis de moins de 3 mois",
      director_id: "Pièce d'identité du dirigeant",
      company_statutes: "Statuts de l'entreprise",
      financial_statements: "Bilans comptables (3 dernières années)",
      tax_package: "Liasse fiscale complète",
      bank_statements_pro: "Relevés bancaires professionnels (6 mois)",
      business_plan: "Business plan",
      financial_forecast: "Prévisionnel financier sur 3 ans",
      quotes: "Devis ou factures proforma"
    },
    en: {
      id_card: "Valid ID (national ID card, passport)",
      proof_of_address: "Proof of address (less than 3 months)",
      pay_slips: "Last 3 pay slips",
      tax_assessment: "Latest tax assessment",
      bank_statements: "Bank statements (3 months)",
      project_justification: "Project justification (quotes, invoices)",
      kbis: "Kbis less than 3 months old",
      director_id: "Director's ID document",
      company_statutes: "Company bylaws",
      financial_statements: "Financial statements (last 3 years)",
      tax_package: "Complete tax package",
      bank_statements_pro: "Professional bank statements (6 months)",
      business_plan: "Business plan",
      financial_forecast: "3-year financial forecast",
      quotes: "Quotes or proforma invoices"
    },
    es: {
      id_card: "Documento de identidad válido (DNI, pasaporte)",
      proof_of_address: "Comprobante de domicilio (menos de 3 meses)",
      pay_slips: "Últimas 3 nóminas",
      tax_assessment: "Última declaración de impuestos",
      bank_statements: "Extractos bancarios (3 meses)",
      project_justification: "Justificación del proyecto (presupuestos, facturas)",
      kbis: "Kbis de menos de 3 meses",
      director_id: "Documento de identidad del director",
      company_statutes: "Estatutos de la empresa",
      financial_statements: "Estados financieros (últimos 3 años)",
      tax_package: "Paquete fiscal completo",
      bank_statements_pro: "Extractos bancarios profesionales (6 meses)",
      business_plan: "Plan de negocios",
      financial_forecast: "Previsión financiera a 3 años",
      quotes: "Presupuestos o facturas proforma"
    },
    pt: {
      id_card: "Documento de identidade válido (BI, passaporte)",
      proof_of_address: "Comprovante de morada (menos de 3 meses)",
      pay_slips: "Últimos 3 recibos de vencimento",
      tax_assessment: "Última declaração de impostos",
      bank_statements: "Extratos bancários (3 meses)",
      project_justification: "Justificação do projeto (orçamentos, faturas)",
      kbis: "Kbis com menos de 3 meses",
      director_id: "Documento de identidade do diretor",
      company_statutes: "Estatutos da empresa",
      financial_statements: "Demonstrações financeiras (últimos 3 anos)",
      tax_package: "Pacote fiscal completo",
      bank_statements_pro: "Extratos bancários profissionais (6 meses)",
      business_plan: "Plano de negócios",
      financial_forecast: "Previsão financeira de 3 anos",
      quotes: "Orçamentos ou faturas proforma"
    },
    it: {
      id_card: "Documento d'identità valido (CI, passaporto)",
      proof_of_address: "Prova di residenza (meno di 3 mesi)",
      pay_slips: "Ultime 3 buste paga",
      tax_assessment: "Ultima dichiarazione dei redditi",
      bank_statements: "Estratti conto bancari (3 mesi)",
      project_justification: "Giustificazione del progetto (preventivi, fatture)",
      kbis: "Kbis di meno di 3 mesi",
      director_id: "Documento d'identità del direttore",
      company_statutes: "Statuto dell'azienda",
      financial_statements: "Bilanci (ultimi 3 anni)",
      tax_package: "Pacchetto fiscale completo",
      bank_statements_pro: "Estratti conto professionali (6 mesi)",
      business_plan: "Business plan",
      financial_forecast: "Previsione finanziaria a 3 anni",
      quotes: "Preventivi o fatture proforma"
    },
    de: {
      id_card: "Gültiger Ausweis (Personalausweis, Reisepass)",
      proof_of_address: "Wohnsitznachweis (weniger als 3 Monate)",
      pay_slips: "Letzte 3 Gehaltsabrechnungen",
      tax_assessment: "Letzter Steuerbescheid",
      bank_statements: "Kontoauszüge (3 Monate)",
      project_justification: "Projektnachweis (Angebote, Rechnungen)",
      kbis: "Kbis weniger als 3 Monate alt",
      director_id: "Ausweis des Geschäftsführers",
      company_statutes: "Unternehmenssatzung",
      financial_statements: "Finanzberichte (letzte 3 Jahre)",
      tax_package: "Vollständiges Steuerpaket",
      bank_statements_pro: "Geschäftliche Kontoauszüge (6 Monate)",
      business_plan: "Geschäftsplan",
      financial_forecast: "3-Jahres-Finanzprognose",
      quotes: "Angebote oder Proforma-Rechnungen"
    },
    nl: {
      id_card: "Geldig identiteitsbewijs (ID-kaart, paspoort)",
      proof_of_address: "Bewijs van adres (minder dan 3 maanden)",
      pay_slips: "Laatste 3 loonstroken",
      tax_assessment: "Laatste belastingaangifte",
      bank_statements: "Bankafschriften (3 maanden)",
      project_justification: "Projectverantwoording (offertes, facturen)",
      kbis: "Kbis minder dan 3 maanden oud",
      director_id: "Identiteitsbewijs van de directeur",
      company_statutes: "Statuten van het bedrijf",
      financial_statements: "Jaarrekeningen (laatste 3 jaar)",
      tax_package: "Volledig belastingpakket",
      bank_statements_pro: "Zakelijke bankafschriften (6 maanden)",
      business_plan: "Bedrijfsplan",
      financial_forecast: "3-jarige financiële prognose",
      quotes: "Offertes of proforma facturen"
    }
  };
  return labels[language] || labels['fr'];
};

export function LoanRequestModal({ open, onOpenChange, user }: LoanRequestModalProps) {
  const { toast } = useToast();
  const translations = useTranslations();
  const t = translations.dialogs.loanRequestModal;
  const { language } = useLanguage();
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, File>>({});
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);

  const accountType = user.accountType === 'business' ? 'business' : 'individual';
  const loanOffers = getTranslatedLoanOffers(getLoanOffersByAccountType(accountType), language);
  const requiredDocuments = getRequiredDocuments(accountType);
  const documentLabels = getDocumentLabels(language);

  const loanRequestSchema = useMemo(
    () => createLoanRequestSchema(t.validationError),
    [t]
  );

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
  
  // Déterminer si on doit utiliser des années :
  // 1. Pour les prêts immobiliers et prêts à long terme connus qui utilisent toujours des années
  // 2. OU si la durée maximale est >= 120 mois (10 ans) pour une meilleure UX
  const longTermLoanTypes = ['mortgage-loan', 'commercial-property-loan'];
  const useYears = loanType && (
    longTermLoanTypes.includes(loanType) || (limits && limits.maxDuration >= 120)
  );
  
  // Convertir la durée en unité appropriée pour l'affichage
  const displayDuration = useYears ? Math.round(duration / 12) : duration;
  
  // Valeurs par défaut sûres : si limits est null, utiliser des defaults raisonnables
  // Pour les années: 5-30 ans (équivalent à 60-360 mois)
  // Pour les mois: 6-360 mois
  const defaultMinMonths = useYears ? 60 : 6;
  const defaultMaxMonths = useYears ? 360 : 360;
  
  const displayMinDuration = useYears 
    ? Math.round((limits?.minDuration || defaultMinMonths) / 12)
    : (limits?.minDuration || defaultMinMonths);
  const displayMaxDuration = useYears 
    ? Math.round((limits?.maxDuration || defaultMaxMonths) / 12)
    : (limits?.maxDuration || defaultMaxMonths);
  
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
        title: t.requestSent,
        description: t.requestSentDescription,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      onOpenChange(false);
      form.reset();
      setUploadedDocuments({});
      setSelectedLoanType(null);
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message || t.errorDescription,
        variant: 'destructive',
      });
    },
  });

  const handleFileUpload = async (documentId: string, file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t.fileTooLarge,
        description: t.fileTooLargeDescription,
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
        title: t.missingDocuments,
        description: `${t.missingDocumentsPrefix} ${missingDocs.map(d => documentLabels[d.id]).join(', ')}`,
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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6" data-testid="dialog-loan-request">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{t.title}</DialogTitle>
          <DialogDescription className="text-sm">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.loanType}</FormLabel>
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
                        <SelectValue placeholder={t.selectLoanTypePlaceholder} />
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
                      <FormLabel className="text-sm">{t.loanAmount}</FormLabel>
                      <FormControl>
                        <div className="space-y-3 w-full">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              min={limits.minAmount}
                              max={limits.maxAmount}
                              step={1000}
                              className="flex-1 min-w-0"
                              data-testid="input-loan-amount"
                            />
                          </div>
                          <div className="px-1">
                            <Slider
                              value={[field.value]}
                              onValueChange={(values: number[]) => field.onChange(values[0])}
                              min={limits.minAmount}
                              max={limits.maxAmount}
                              step={1000}
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground px-1">
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
                      <FormLabel className="text-sm">{useYears ? t.durationYears || 'Durée (années)' : t.durationMonths}</FormLabel>
                      <FormControl>
                        <div className="space-y-3 w-full">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={displayDuration}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                field.onChange(useYears ? value * 12 : value);
                              }}
                              min={displayMinDuration}
                              max={displayMaxDuration}
                              className="flex-1 min-w-0"
                              data-testid="input-loan-duration"
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
                              {useYears ? (t.years || 'ans') : t.months}
                            </span>
                          </div>
                          <div className="px-1">
                            <Slider
                              value={[displayDuration]}
                              onValueChange={(values: number[]) => {
                                field.onChange(useYears ? values[0] * 12 : values[0]);
                              }}
                              min={displayMinDuration}
                              max={displayMaxDuration}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>{displayMinDuration} {useYears ? (t.years || 'ans') : t.months}</span>
                            <span>{displayMaxDuration} {useYears ? (t.years || 'ans') : t.months}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 p-3 sm:p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">{t.interestRate}</span>
                    <span className="font-semibold text-sm sm:text-base">{interestRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">{t.estimatedMonthlyPayment}</span>
                    <span className="font-semibold text-base sm:text-lg">{monthlyPayment.toFixed(2)}€</span>
                  </div>
                </div>
              </>
            )}

            {selectedLoanType && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">{t.requiredDocuments}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    {t.requiredDocumentsDescription}
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {requiredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border rounded-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                          <span className="text-xs sm:text-sm font-medium truncate">{documentLabels[doc.id]}</span>
                          {doc.required && <Badge variant="destructive" className="h-4 sm:h-5 text-xs flex-shrink-0">{t.required}</Badge>}
                          {!doc.required && <Badge variant="secondary" className="h-4 sm:h-5 text-xs flex-shrink-0">{t.optional}</Badge>}
                        </div>
                        {uploadedDocuments[doc.id] && (
                          <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground mt-1 sm:mt-2 min-w-0 overflow-hidden max-w-full">
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                            <span className="truncate block max-w-[180px] sm:max-w-[280px]" title={uploadedDocuments[doc.id].name}>{uploadedDocuments[doc.id].name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        {uploadedDocuments[doc.id] ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument(doc.id)}
                            data-testid={`button-remove-${doc.id}`}
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        ) : (
                          <label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              asChild
                              data-testid={`button-upload-${doc.id}`}
                              className="text-xs sm:text-sm h-8 sm:h-9"
                            >
                              <span className="cursor-pointer">
                                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">{t.attach}</span>
                                <span className="sm:hidden">+</span>
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

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-loan-request"
                className="w-full sm:w-auto"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={createLoanMutation.isPending || !selectedLoanType}
                data-testid="button-submit-loan-request"
                className="w-full sm:w-auto"
              >
                {createLoanMutation.isPending && <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />}
                {t.submit}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
