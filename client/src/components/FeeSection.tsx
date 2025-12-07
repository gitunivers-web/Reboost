import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/lib/i18n';
import { Download, ChevronDown, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Fee {
  id: string;
  feeType: string;
  reason: string;
  amount: number;
  createdAt: string | null;
  category: 'loan' | 'transfer' | 'account';
  isPaid?: boolean;
  paidAt?: string | null;
}

interface FeeSectionProps {
  fees: Fee[];
}

export default function FeeSection({ fees }: FeeSectionProps) {
  const t = useTranslations();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    loan: true,
    transfer: true,
    account: true,
  });

  const unpaidFees = fees.filter(f => !f.isPaid);
  const paidFees = fees.filter(f => f.isPaid);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const categorizedFees = {
    loan: unpaidFees.filter((f) => f.category === 'loan'),
    transfer: unpaidFees.filter((f) => f.category === 'transfer'),
    account: unpaidFees.filter((f) => f.category === 'account'),
  };

  const totalUnpaidFees = unpaidFees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);

  const categoryLabels = {
    loan: t.fee.loanFees,
    transfer: t.fee.transferFees,
    account: t.fee.accountFees,
  };

  const handleDownloadStatement = () => {
    const content = `RELEVÉ DE FRAIS - Altus Finances\n\nDate: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    let feeContent = content;
    
    Object.entries(categorizedFees).forEach(([category, categoryFees]) => {
      if (categoryFees.length > 0) {
        feeContent += `\n${categoryLabels[category as keyof typeof categoryLabels]}:\n`;
        categoryFees.forEach(fee => {
          feeContent += `  - ${fee.feeType}: ${formatCurrency(fee.amount)}\n`;
          feeContent += `    ${fee.reason}\n`;
          feeContent += `    Date: ${fee.createdAt}\n\n`;
        });
      }
    });
    
    feeContent += `\nTOTAL: ${formatCurrency(totalFees)}\n`;
    
    const blob = new Blob([feeContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `releve-frais-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-sm border-card-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.fees}</CardTitle>
          {unpaidFees.length > 0 && (
            <Badge className="h-5 text-xs flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40">
              <AlertCircle className="h-3 w-3" />
              {unpaidFees.length}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 text-xs px-2"
          data-testid="button-download-statement"
          onClick={handleDownloadStatement}
        >
          <Download className="h-4 w-4 mr-2" />
          {t.fee.downloadStatement}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {unpaidFees.length > 0 && (
          <>
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-700 dark:text-orange-500">{t.fee.feesToPay}</h3>
                  <p className="text-sm text-muted-foreground">
                    {unpaidFees.length} {unpaidFees.length > 1 ? t.fee.unpaidFeesCount : t.fee.unpaidFeesSingular} {formatCurrency(totalUnpaidFees)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {(['loan', 'transfer', 'account'] as const).map((category) => {
          if (categorizedFees[category].length === 0) return null;

          return (
            <Collapsible
              key={category}
              open={openCategories[category]}
              onOpenChange={(open) =>
                setOpenCategories((prev) => ({ ...prev, [category]: open }))
              }
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover-elevate px-3 rounded-md">
                <span className="font-semibold">{categoryLabels[category]}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openCategories[category] ? 'transform rotate-180' : ''
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {categorizedFees[category].map((fee) => (
                  <div
                    key={fee.id}
                    className="flex justify-between items-start border rounded-md p-3 text-sm gap-3"
                    data-testid={`fee-${fee.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{fee.feeType}</p>
                        {!fee.isPaid && (
                          <Badge variant="outline" className="text-xs">{t.fee.pendingValidation}</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">{fee.reason}</p>
                      <p className="text-muted-foreground text-xs mt-1">{fee.createdAt}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-mono font-semibold">{formatCurrency(fee.amount)}</p>
                      {!fee.isPaid && (
                        <Badge variant="secondary" className="text-xs">
                          {t.fee.autoValidatedViaCode}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-orange-700 dark:text-orange-400">{t.fee.totalUnpaid}</span>
            <span className="text-2xl font-mono font-bold text-orange-700 dark:text-orange-400" data-testid="text-unpaid-fees">
              {formatCurrency(totalUnpaidFees)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{t.fee.totalOverall}</span>
            <span className="font-mono" data-testid="text-total-fees">
              {formatCurrency(totalFees)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
