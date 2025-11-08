import { useState } from 'react';
import { CreditCard, Info, Check, Globe, Shield, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import VirtualBankCard from './VirtualBankCard';
import CardTermsDialog from './CardTermsDialog';

export default function BankCardOffer() {
  const t = useTranslations();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full space-y-3">
          <VirtualBankCard />
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-card-details"
          >
            <Info className="h-4 w-4 mr-2" />
            {t.bankCard.viewDetails}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-card-details">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent" data-testid="text-modal-title">
              {t.bankCard.modalTitle}
            </DialogTitle>
            <DialogDescription data-testid="text-modal-subtitle">
              {t.bankCard.modalSubtitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" data-testid="text-advantages-title">
                <Check className="h-5 w-5 text-green-600" />
                {t.bankCard.advantagesTitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm" data-testid="text-advantage-security">{t.bankCard.advantages.maxSecurity}</p>
                    <p className="text-xs text-muted-foreground">{t.bankCard.advantages.maxSecurityDesc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm" data-testid="text-advantage-instant">{t.bankCard.advantages.instantActivation}</p>
                    <p className="text-xs text-muted-foreground">{t.bankCard.advantages.instantActivationDesc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm" data-testid="text-advantage-nofees">{t.bankCard.advantages.noFeesEuro}</p>
                    <p className="text-xs text-muted-foreground">{t.bankCard.advantages.noFeesEuroDesc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Globe className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm" data-testid="text-advantage-global">{t.bankCard.advantages.globallyAccepted}</p>
                    <p className="text-xs text-muted-foreground">{t.bankCard.advantages.globallyAcceptedDesc}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4" data-testid="text-fees-title">{t.bankCard.feesTitle}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="font-medium" data-testid="text-fee-annual">{t.bankCard.fees.annualFee}</span>
                  <span className="text-blue-600 font-semibold">{t.bankCard.fees.annualFeeAmount}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="font-medium" data-testid="text-fee-transaction">{t.bankCard.fees.transactionFee}</span>
                  <span className="text-green-600 font-semibold">{t.bankCard.fees.transactionFeeAmount}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="font-medium" data-testid="text-fee-withdrawal">{t.bankCard.fees.withdrawalFee}</span>
                  <span className="text-green-600 font-semibold">{t.bankCard.fees.withdrawalFeeAmount}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="font-medium" data-testid="text-fee-foreign">{t.bankCard.fees.foreignFee}</span>
                  <span className="text-blue-600 font-semibold">{t.bankCard.fees.foreignFeeAmount}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4" data-testid="text-specifications-title">{t.bankCard.specificationsTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-muted-foreground">{t.bankCard.specifications.cardType}</span>
                  <span className="font-semibold">{t.bankCard.specifications.cardTypeValue}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-muted-foreground">{t.bankCard.specifications.creditLimit}</span>
                  <span className="font-semibold">{t.bankCard.specifications.creditLimitValue}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-muted-foreground">{t.bankCard.specifications.validity}</span>
                  <span className="font-semibold">{t.bankCard.specifications.validityValue}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-muted-foreground">{t.bankCard.specifications.delivery}</span>
                  <span className="font-semibold">{t.bankCard.specifications.deliveryValue}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-2" data-testid="text-order-process-title">{t.bankCard.orderProcess}</h4>
              <p className="text-sm text-muted-foreground mb-4">{t.bankCard.orderProcessDesc}</p>
              <Button 
                className="w-full" 
                data-testid="button-order-modal"
                onClick={() => {
                  toast({
                    title: t.bankCard.orderSuccess,
                    description: t.bankCard.orderSuccessDesc,
                  });
                  setIsModalOpen(false);
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {t.bankCard.orderCard}
              </Button>
            </div>

            <div className="text-center">
              <Button 
                variant="ghost" 
                className="text-sm text-muted-foreground"
                data-testid="button-terms"
                onClick={() => setIsTermsOpen(true)}
              >
                {t.bankCard.termsConditions}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CardTermsDialog open={isTermsOpen} onOpenChange={setIsTermsOpen} />
    </>
  );
}
