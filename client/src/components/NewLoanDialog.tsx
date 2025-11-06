import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface NewLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INDIVIDUAL_LOAN_TYPES = {
  personal: { name: 'Prêt personnel', minRate: 2.9, maxRate: 7.9 },
  auto: { name: 'Prêt auto', minRate: 1.9, maxRate: 5.9 },
  mortgage: { name: 'Prêt immobilier', minRate: 2.5, maxRate: 4.5 },
  green: { name: 'Prêt vert', minRate: 0.5, maxRate: 4.5 },
  renovation: { name: 'Prêt rénovation', minRate: 2.5, maxRate: 6.9 },
  student: { name: 'Prêt étudiant', minRate: 1.5, maxRate: 3.5 },
} as const;

const BUSINESS_LOAN_TYPES = {
  business: { name: 'Prêt professionnel', minRate: 3.5, maxRate: 8.5 },
  cashFlow: { name: 'Crédit de trésorerie', minRate: 4.0, maxRate: 9.0 },
  equipment: { name: 'Financement équipement', minRate: 3.9, maxRate: 7.5 },
  commercialProperty: { name: 'Prêt immobilier pro', minRate: 2.9, maxRate: 5.5 },
  lineOfCredit: { name: 'Ligne de crédit', minRate: 5.0, maxRate: 9.5 },
  vehicleFleet: { name: 'Crédit véhicule pro', minRate: 3.2, maxRate: 6.5 },
} as const;

export default function NewLoanDialog({ open, onOpenChange }: NewLoanDialogProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: open,
  });

  const LOAN_TYPES = user?.accountType === 'business' ? BUSINESS_LOAN_TYPES : INDIVIDUAL_LOAN_TYPES;
  const defaultLoanType = user?.accountType === 'business' ? 'business' : 'personal';
  
  const [loanType, setLoanType] = useState<keyof typeof INDIVIDUAL_LOAN_TYPES | keyof typeof BUSINESS_LOAN_TYPES>(defaultLoanType as any);
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    duration: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentsUploaded, setDocumentsUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const needsKYC = user?.kycStatus === 'pending';

  useEffect(() => {
    if (user?.accountType && open) {
      const correctDefaultType = user.accountType === 'business' ? 'business' : 'personal';
      setLoanType(correctDefaultType as any);
    }
  }, [user?.accountType, open]);

  useEffect(() => {
    if (loanType && user?.accountType) {
      const isBusinessAccount = user.accountType === 'business';
      let selectedType: { name: string; minRate: number; maxRate: number } | undefined;
      
      if (isBusinessAccount && loanType in BUSINESS_LOAN_TYPES) {
        selectedType = BUSINESS_LOAN_TYPES[loanType as keyof typeof BUSINESS_LOAN_TYPES];
      } else if (!isBusinessAccount && loanType in INDIVIDUAL_LOAN_TYPES) {
        selectedType = INDIVIDUAL_LOAN_TYPES[loanType as keyof typeof INDIVIDUAL_LOAN_TYPES];
      }
      
      if (selectedType) {
        const avgRate = ((selectedType.minRate + selectedType.maxRate) / 2).toFixed(1);
        setFormData(prev => ({ ...prev, interestRate: avgRate }));
      }
    }
  }, [loanType, user?.accountType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || amount <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    } else if (amount > 1000000) {
      newErrors.amount = 'Le montant ne peut pas dépasser 1 000 000 €';
    }

    const rate = parseFloat(formData.interestRate);
    if (!formData.interestRate || rate < 0) {
      newErrors.interestRate = 'Le taux doit être positif';
    } else if (rate > 20) {
      newErrors.interestRate = 'Le taux ne peut pas dépasser 20%';
    }

    const duration = parseInt(formData.duration);
    if (!formData.duration || duration <= 0) {
      newErrors.duration = 'La durée doit être supérieure à 0';
    } else if (duration > 360) {
      newErrors.duration = 'La durée ne peut pas dépasser 360 mois';
    }

    if (needsKYC && !documentsUploaded) {
      newErrors.documents = 'Vous devez télécharger vos documents KYC pour votre première demande';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createLoanMutation = useMutation({
    mutationFn: async (data: { amount: string; duration: number; loanType: string }) => {
      const response = await apiRequest('POST', '/api/loans', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
      toast({
        title: 'Demande de prêt envoyée',
        description: 'Votre demande de prêt a été soumise avec succès.',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande de prêt.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createLoanMutation.mutate({
        amount: formData.amount,
        duration: parseInt(formData.duration),
        loanType: loanType as string,
      });
    }
  };

  const resetForm = () => {
    setFormData({ amount: '', interestRate: '', duration: '' });
    setLoanType(defaultLoanType as any);
    setErrors({});
    setDocumentsUploaded(false);
    setUploadedFiles([]);
    setUploadingFiles(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const fileArray = Array.from(files);
    const successfulFiles: File[] = [];
    let errorCount = 0;

    try {
      for (const file of fileArray) {
        try {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('documentType', 'identity');
          formData.append('loanType', loanType as string);

          const response = await fetch('/api/kyc/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          if (response.ok) {
            successfulFiles.push(file);
          } else {
            errorCount++;
            const error = await response.json();
            console.error('Upload error:', error);
          }
        } catch (err) {
          console.error('File upload error:', err);
          errorCount++;
        }
      }

      if (successfulFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...successfulFiles]);
        setDocumentsUploaded(true);
        toast({
          title: 'Documents téléchargés',
          description: `${successfulFiles.length} document(s) envoyé(s) avec succès.`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: 'Erreur partielle',
          description: `${errorCount} document(s) n'ont pas pu être téléchargés.`,
          variant: 'destructive',
        });
      }

      if (e.target) {
        e.target.value = '';
      }
    } finally {
      setUploadingFiles(false);
    }
  };

  const calculateMonthlyPayment = () => {
    const amount = parseFloat(formData.amount);
    const rate = parseFloat(formData.interestRate) / 100 / 12;
    const duration = parseInt(formData.duration);
    
    if (amount > 0 && rate >= 0 && duration > 0) {
      if (rate === 0) {
        return amount / duration;
      }
      return amount * (rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1);
    }
    return 0;
  };

  const monthlyPayment = calculateMonthlyPayment();

  if (userLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t.dashboard.newLoan}</DialogTitle>
          <DialogDescription>
            {needsKYC 
              ? "Première demande : veuillez fournir vos documents d'identité et compléter le formulaire"
              : "Remplissez le formulaire pour soumettre une nouvelle demande de prêt"
            }
          </DialogDescription>
        </DialogHeader>

        {needsKYC && (
          <Alert className="border-primary">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Première demande :</strong> Vos documents seront vérifiés une seule fois. 
              Les demandes suivantes ne nécessiteront plus de documents.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={needsKYC && !documentsUploaded ? "documents" : "loan"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents" disabled={!needsKYC} data-testid="tab-documents">
                {documentsUploaded ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> : <FileText className="h-4 w-4 mr-2" />}
                Documents KYC
              </TabsTrigger>
              <TabsTrigger value="loan" data-testid="tab-loan-details">
                Détails du prêt
              </TabsTrigger>
            </TabsList>

            {needsKYC && (
              <TabsContent value="documents" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">Documents requis</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Pièce d'identité (Carte d'identité ou Passeport)</li>
                      <li>• Justificatif de domicile (moins de 3 mois)</li>
                      <li>• Relevé bancaire (derniers 3 mois)</li>
                    </ul>
                  </div>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                    data-testid="input-kyc-documents"
                    disabled={uploadingFiles}
                  />
                  {uploadingFiles && (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm font-medium">Envoi en cours...</span>
                    </div>
                  )}
                  {documentsUploaded && !uploadingFiles && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {uploadedFiles.length} document(s) téléchargé(s) avec succès
                      </span>
                    </div>
                  )}
                </div>
                {errors.documents && (
                  <p className="text-sm text-destructive text-center">{errors.documents}</p>
                )}
              </TabsContent>
            )}

            <TabsContent value="loan" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanType">Type de prêt</Label>
                <Select value={loanType} onValueChange={(value) => setLoanType(value as any)}>
                  <SelectTrigger id="loanType" data-testid="select-loan-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOAN_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.name} ({value.minRate}% - {value.maxRate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant du prêt (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100000"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    setErrors({ ...errors, amount: '' });
                  }}
                  className={errors.amount ? 'border-destructive' : ''}
                  data-testid="input-loan-amount"
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">
                  Taux d'intérêt annuel (%)
                  <span className="text-xs text-muted-foreground ml-2">
                    (Taux suggéré basé sur le type de prêt)
                  </span>
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  placeholder="3.5"
                  value={formData.interestRate}
                  onChange={(e) => {
                    setFormData({ ...formData, interestRate: e.target.value });
                    setErrors({ ...errors, interestRate: '' });
                  }}
                  className={errors.interestRate ? 'border-destructive' : ''}
                  data-testid="input-loan-interest-rate"
                />
                {errors.interestRate && (
                  <p className="text-sm text-destructive">{errors.interestRate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée (mois)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  value={formData.duration}
                  onChange={(e) => {
                    setFormData({ ...formData, duration: e.target.value });
                    setErrors({ ...errors, duration: '' });
                  }}
                  className={errors.duration ? 'border-destructive' : ''}
                  data-testid="input-loan-duration"
                />
                {errors.duration && (
                  <p className="text-sm text-destructive">{errors.duration}</p>
                )}
              </div>

              {monthlyPayment > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Mensualité estimée:</strong>{' '}
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(monthlyPayment)}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              data-testid="button-cancel-loan"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createLoanMutation.isPending || uploadingFiles || (needsKYC && !documentsUploaded)} 
              data-testid="button-submit-loan"
            >
              {createLoanMutation.isPending ? 'Envoi...' : 'Soumettre la demande'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
