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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const percentage = (currentCapacity / maxCapacity) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="bg-card border-card-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="inline-block bg-primary/10 px-3 py-1.5 rounded-full">
          <CardTitle className="text-sm font-semibold text-primary">{t.dashboard.borrowingCapacity}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-card-foreground" data-testid="text-borrowing-capacity">
            {formatCurrency(currentCapacity)}
          </p>
          <p className="text-sm text-muted-foreground mt-2 font-medium">{Math.round(percentage)}% {t.dashboard.available}</p>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
