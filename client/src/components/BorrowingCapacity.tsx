import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';

interface BorrowingCapacityProps {
  maxCapacity: number;
  currentCapacity: number;
}

export default function BorrowingCapacity({
  maxCapacity,
  currentCapacity,
}: BorrowingCapacityProps) {
  const t = useTranslations();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const percentage = (currentCapacity / maxCapacity) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="shadow-sm border bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.borrowingCapacity}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <p className="text-2xl font-bold" data-testid="text-borrowing-capacity">
            {formatCurrency(currentCapacity)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">disponible sur {formatCurrency(maxCapacity)}</p>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">{Math.round(percentage)}% disponible</p>
      </CardContent>
    </Card>
  );
}
