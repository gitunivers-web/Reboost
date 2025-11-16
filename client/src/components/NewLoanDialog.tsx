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
import { apiRequest, getApiUrl } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface NewLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getIndividualLoanTypes = (t: any) => ({
  personal: { minRate: 2.9, maxRate: 7.9 },
  auto: { minRate: 1.9, maxRate: 5.9 },
  mortgage: { minRate: 2.5, maxRate: 4.5 },
  green: { minRate: 0.5, maxRate: 4.5 },
  renovation: { minRate: 2.5, maxRate: 6.9 },
  student: { minRate: 1.5, maxRate: 3.5 },
} as const);

const getBusinessLoanTypes = (t: any) => ({
  business: { minRate: 3.5, maxRate: 8.5 },
  cashFlow: { minRate: 4.0, maxRate: 9.0 },
  equipment: { minRate: 3.9, maxRate: 7.5 },
  commercialProperty: { minRate: 2.9, maxRate: 5.5 },
  lineOfCredit: { minRate: 5.0, maxRate: 9.5 },
  vehicleFleet: { minRate: 3.2, maxRate: 6.5 },
} as const);

export default function NewLoanDialog({ open, onOpenChange }: NewLoanDialogProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: open,
  });

  const LOAN_TYPES = user?.accountType === 'business' ? getBusinessLoanTypes(t) : getIndividualLoanTypes(t);
  const defaultLoanType = user?.accountType === 'business' ? 'business' : 'personal';
  
  const [loanType, setLoanType] = useState<keyof ReturnType<typeof getIndividualLoanTypes> | keyof ReturnType<typeof getBusinessLoanTypes>>(defaultLoanType as any);
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
      const selectedType = LOAN_TYPES[loanType as keyof typeof LOAN_TYPES];
      
      if (selectedType) {
        const avgRate = ((selectedType.minRate + selectedType.maxRate) / 2).toFixed(1);
        setFormData(prev => ({ ...prev, interestRate: avgRate }));
      }
    }
  }, [loanType, user?.accountType, LOAN_TYPES]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || amount <= 0) {
      newErrors.amount = t.dialogs.newLoan.errors.amountMustBePositive;
    } else if (amount > 1000000) {
      newErrors.amount = t.dialogs.newLoan.errors.amountMaxExceeded;
    }

    const rate = parseFloat(formData.interestRate);
    if (!formData.interestRate || rate < 0) {
      newErrors.interestRate = t.dialogs.newLoan.errors.rateMustBePositive;
    } else if (rate > 20) {
      newErrors.interestRate = t.dialogs.newLoan.errors.rateMaxExceeded;
    }

    const duration = parseInt(formData.duration);
    if (!formData.duration || duration <= 0) {
      newErrors.duration = t.dialogs.newLoan.errors.durationMustBePositive;
    } else if (duration > 360) {
      newErrors.duration = t.dialogs.newLoan.errors.durationMaxExceeded;
    }

    if (needsKYC && !documentsUploaded) {
      newErrors.documents = t.dialogs.newLoan.errors.documentsRequired;
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
        title: t.dialogs.newLoan.success.loanSubmitted,
        description: t.dialogs.newLoan.success.loanSubmittedDesc,
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || t.dialogs.newLoan.error.loanErrorDesc;
      
      toast({
        title: t.dialogs.newLoan.error.loanError,
        description: errorMessage,
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
      const csrfToken = await fetch(getApiUrl('/api/csrf-token'), {
        credentials: 'include',
      }).then((res) => res.json()).then((data) => data.csrfToken);

      for (const file of fileArray) {
        try {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('documentType', 'identity');
          formData.append('loanType', loanType as string);

          const response = await fetch(getApiUrl('/api/kyc/upload'), {
            method: 'POST',
            headers: {
              'X-CSRF-Token': csrfToken,
            },
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
          title: t.dialogs.newLoan.success.documentsUploaded,
          description: `${successfulFiles.length} ${t.dialogs.newLoan.success.documentsUploadedDesc}`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: t.dialogs.newLoan.error.partialUploadError,
          description: `${errorCount} ${t.dialogs.newLoan.error.partialUploadErrorDesc}`,
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
              ? t.dialogs.newLoan.subtitleFirstRequest
              : t.dialogs.newLoan.subtitleRegular
            }
          </DialogDescription>
        </DialogHeader>

        {needsKYC && (
          <Alert className="border-primary">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{t.dialogs.newLoan.firstRequestAlert}</strong> {t.dialogs.newLoan.firstRequestAlertDesc}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={needsKYC && !documentsUploaded ? "documents" : "loan"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents" disabled={!needsKYC} data-testid="tab-documents">
                {documentsUploaded ? <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> : <FileText className="h-4 w-4 mr-2" />}
                {t.dialogs.newLoan.kycDocumentsTab}
              </TabsTrigger>
              <TabsTrigger value="loan" data-testid="tab-loan-details">
                {t.dialogs.newLoan.loanDetailsTab}
              </TabsTrigger>
            </TabsList>

            {needsKYC && (
              <TabsContent value="documents" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">{t.dialogs.newLoan.requiredDocuments}</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {t.dialogs.newLoan.identityDoc}</li>
                      <li>• {t.dialogs.newLoan.addressProof}</li>
                      <li>• {t.dialogs.newLoan.bankStatement}</li>
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
                      <span className="text-sm font-medium">{t.dialogs.newLoan.uploadingInProgress}</span>
                    </div>
                  )}
                  {documentsUploaded && !uploadingFiles && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {uploadedFiles.length} {t.dialogs.newLoan.documentsUploadedSuccess}
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
                <Label htmlFor="loanType">{t.dialogs.newLoan.loanType}</Label>
                <Select value={loanType} onValueChange={(value) => setLoanType(value as any)}>
                  <SelectTrigger id="loanType" data-testid="select-loan-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOAN_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {t.dialogs.newLoan.loanTypes[key as keyof typeof t.dialogs.newLoan.loanTypes]} ({value.minRate}% - {value.maxRate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t.dialogs.newLoan.amount}</Label>
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
                <Label htmlFor="interestRate">{t.dialogs.newLoan.estimatedRate}</Label>
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
                <Label htmlFor="duration">{t.dialogs.newLoan.duration} ({t.dialogs.newLoan.months})</Label>
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
                    <strong>{t.dialogs.newLoan.monthlyPayment}:</strong>{' '}
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
              {t.dialogs.newLoan.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={createLoanMutation.isPending || uploadingFiles || (needsKYC && !documentsUploaded)} 
              data-testid="button-submit-loan"
            >
              {createLoanMutation.isPending ? t.dialogs.newLoan.submitting : t.dialogs.newLoan.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
