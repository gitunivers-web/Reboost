import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/lib/i18n';
import { CheckCircle2, Clock, Send, Shield, Banknote } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Transfer {
  id: string;
  amount: number;
  recipient: string;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'completed' | 'suspended';
  currentStep: number;
  updatedAt: string;
}

interface PendingTransfersProps {
  transfers: Transfer[];
}

export default function PendingTransfers({ transfers }: PendingTransfersProps) {
  const t = useTranslations();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusInfo = (status: Transfer['status']) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return { label: 'Complété', variant: 'default' as const, icon: CheckCircle2 };
      case 'in-progress':
        return { label: 'En traitement', variant: 'secondary' as const, icon: Shield };
      case 'suspended':
      case 'rejected':
        return { label: 'Suspendu', variant: 'destructive' as const, icon: Clock };
      default:
        return { label: 'En attente de validation', variant: 'outline' as const, icon: Clock };
    }
  };

  const getProgressPercentage = (transfer: Transfer) => {
    if (transfer.status === 'completed' || transfer.status === 'approved') return 100;
    if (transfer.status === 'in-progress') return 90;
    if (transfer.status === 'suspended' || transfer.status === 'rejected') return 0;
    return Math.min(transfer.currentStep * 30, 70);
  };

  const getStepLabel = (transfer: Transfer) => {
    if (transfer.status === 'completed' || transfer.status === 'approved') return 'Transfert complété';
    if (transfer.status === 'in-progress') return 'Traitement en cours';
    if (transfer.status === 'suspended' || transfer.status === 'rejected') return 'Transfert suspendu';
    return `Validation en cours (étape ${transfer.currentStep})`;
  };

  return (
    <Card className="shadow-sm border bg-white dark:bg-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.pendingTransfers}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {transfers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Aucun transfert en cours</p>
        ) : (
          transfers.slice(0, 2).map((transfer) => {
            const statusInfo = getStatusInfo(transfer.status);
            const StatusIcon = statusInfo.icon;
            const progress = getProgressPercentage(transfer);
            return (
              <div
                key={transfer.id}
                className="p-2 rounded-md border space-y-1"
                data-testid={`transfer-${transfer.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{formatCurrency(transfer.amount)}</p>
                    <p className="text-xs text-muted-foreground">{transfer.recipient}</p>
                  </div>
                  <Badge variant={statusInfo.variant} className="text-xs flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{getStepLabel(transfer)}</span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
                <p className="text-xs text-muted-foreground">{transfer.updatedAt}</p>
              </div>
            );
          })
        )}
        {transfers.length > 2 && (
          <p className="text-xs text-muted-foreground pt-2">
            +{transfers.length - 2} autres transferts
          </p>
        )}
      </CardContent>
    </Card>
  );
}
