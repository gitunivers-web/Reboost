import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';

interface BalanceOverviewProps {
  currentBalance: number;
  activeLoansCount: number;
  totalBorrowed: number;
  availableCredit: number;
  lastUpdated: string;
}

export default function BalanceOverview({
  currentBalance,
  activeLoansCount,
  totalBorrowed,
  availableCredit,
  lastUpdated,
}: BalanceOverviewProps) {
  const t = useTranslations();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <Card className="shadow-sm border bg-white dark:bg-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.currentBalance}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-lg font-bold" data-testid="text-current-balance">
            {formatCurrency(currentBalance)}
          </p>
          <p className="text-xs text-muted-foreground">{lastUpdated}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">{t.dashboard.activeLoans}</p>
            <p className="text-sm font-semibold" data-testid="text-active-loans">
              {activeLoansCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.dashboard.totalBorrowed}</p>
            <p className="text-sm font-semibold" data-testid="text-total-borrowed">
              {formatCurrency(totalBorrowed)}
            </p>
          </div>
        </div>
        <div className="pt-1">
          <p className="text-xs text-muted-foreground">{t.dashboard.availableCredit}</p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400" data-testid="text-available-credit">
            {formatCurrency(availableCredit)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
