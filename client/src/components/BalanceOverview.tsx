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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="bg-card border-card-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="inline-block bg-primary/10 px-3 py-1.5 rounded-full">
          <CardTitle className="text-sm font-semibold text-primary">{t.dashboard.currentBalance}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-4xl font-bold text-card-foreground" data-testid="text-current-balance">
            {formatCurrency(currentBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{lastUpdated}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-card-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium">{t.dashboard.activeLoans}</p>
            <p className="text-2xl font-bold text-card-foreground" data-testid="text-active-loans">
              {activeLoansCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium">{t.dashboard.totalBorrowed}</p>
            <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-borrowed">
              0
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
