import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n';
import { Plus, ArrowRightLeft, History } from 'lucide-react';
import NewLoanDialog from './NewLoanDialog';
import TransactionHistoryDialog from './TransactionHistoryDialog';

export default function QuickActions() {
  const t = useTranslations();
  const [, setLocation] = useLocation();
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  return (
    <>
      <Card className="shadow-sm border bg-white dark:bg-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.quickActions}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full justify-start gap-2 h-9 text-sm"
            variant="default"
            data-testid="button-new-loan"
            onClick={() => setLoanDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t.dashboard.newLoan}
          </Button>
          <Button
            className="w-full justify-start gap-2 h-9 text-sm"
            variant="outline"
            data-testid="button-transfer-funds"
            onClick={() => setLocation('/transfer/new')}
          >
            <ArrowRightLeft className="h-4 w-4" />
            {t.dashboard.transferFunds}
          </Button>
          <Button
            className="w-full justify-start gap-2 h-9 text-sm"
            variant="outline"
            data-testid="button-transaction-history"
            onClick={() => setHistoryDialogOpen(true)}
          >
            <History className="h-4 w-4" />
            {t.dashboard.transactionHistory}
          </Button>
        </CardContent>
      </Card>

      <NewLoanDialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen} />
      <TransactionHistoryDialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen} />
    </>
  );
}
