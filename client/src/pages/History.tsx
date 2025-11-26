import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, TrendingDown, Receipt, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { DashboardCard, SectionTitle } from '@/components/fintech';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
  transferId?: string;
}

function HistorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function History() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Hier à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="w-5 h-5 text-accent" />;
      case 'debit':
        return <ArrowUpRight className="w-5 h-5 text-destructive" />;
      case 'fee':
        return <FileText className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Receipt className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credit':
        return t.history.typeCredit;
      case 'debit':
        return t.history.typeDebit;
      case 'fee':
        return t.history.typeFee;
      default:
        return type;
    }
  };

  const filteredTransactions = transactions?.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalCredit = transactions
    ?.filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  const totalDebit = transactions
    ?.filter(t => t.type === 'debit' || t.type === 'fee')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  const netBalance = totalCredit - totalDebit;

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <HistorySkeleton />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <SectionTitle
          title={t.history.pageTitle}
          subtitle={t.history.pageDescription}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard className="bg-gradient-to-br from-accent/10 via-background to-background border-accent/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.history.totalCredits}</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-accent tracking-tight" data-testid="text-total-credit">
              +{formatCurrency(totalCredit.toString())}
            </p>
          </DashboardCard>

          <DashboardCard className="bg-gradient-to-br from-destructive/10 via-background to-background border-destructive/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center shadow-sm">
                <TrendingDown className="h-7 w-7 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{t.history.totalDebits}</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-destructive tracking-tight" data-testid="text-total-debit">
              -{formatCurrency(totalDebit.toString())}
            </p>
          </DashboardCard>

          <DashboardCard className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                <Receipt className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Solde net</p>
              </div>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${netBalance >= 0 ? 'text-accent' : 'text-destructive'}`} data-testid="text-net-balance">
              {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance.toString())}
            </p>
          </DashboardCard>
        </div>

        {/* Filters */}
        <DashboardCard>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t.history.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-border/50 focus:border-primary transition-colors"
                data-testid="input-search-history"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px] border-border/50" data-testid="select-type-filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.history.allTypes}</SelectItem>
                <SelectItem value="credit">{t.history.typeCredit}</SelectItem>
                <SelectItem value="debit">{t.history.typeDebit}</SelectItem>
                <SelectItem value="fee">{t.history.typeFee}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DashboardCard>

        {/* Transactions List */}
        {!filteredTransactions || filteredTransactions.length === 0 ? (
          <DashboardCard className="bg-muted/20">
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                <Receipt className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">{t.history.noTransactionsFound}</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                {searchQuery || typeFilter !== 'all'
                  ? t.history.noTransactionsYet
                  : t.history.noTransactionsYet}
              </p>
            </div>
          </DashboardCard>
        ) : (
          <DashboardCard className="overflow-hidden p-0">
            <div className="divide-y divide-border/50">
              {filteredTransactions.map((transaction, index) => {
                const isTransfer = transaction.type === 'debit' && transaction.description.toLowerCase().includes('transfer');
                const transferUrl = transaction.transferId ? `/transfer/${transaction.transferId}` : (isTransfer ? `/transfer/${transaction.id}` : null);
                
                const content = (
                  <div className={`p-5 hover-elevate active-elevate-2 transition-all ${index === 0 ? 'rounded-t-2xl' : ''} ${
                    index === filteredTransactions.length - 1 ? 'rounded-b-2xl' : ''
                  }`}>
                    <div className="flex items-center gap-5">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                          transaction.type === 'credit' ? 'bg-gradient-to-br from-accent/15 to-accent/5' :
                          transaction.type === 'debit' ? 'bg-gradient-to-br from-destructive/15 to-destructive/5' :
                          'bg-gradient-to-br from-muted to-muted/50'
                        }`}>
                          {getTypeIcon(transaction.type)}
                        </div>
                      </div>

                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="font-bold text-lg text-foreground truncate">{transaction.description}</h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="text-xs font-medium">
                            {getTypeLabel(transaction.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-2xl font-bold font-mono tracking-tight ${
                          transaction.type === 'credit' ? 'text-accent' :
                          transaction.type === 'debit' ? 'text-destructive' :
                          'text-muted-foreground'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5 font-mono">
                          ID: {transaction.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>
                );
                
                return (
                  <div key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                    {transferUrl ? (
                      <Link href={transferUrl}>{content}</Link>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        )}

        {/* Total Transactions Count */}
        {filteredTransactions && filteredTransactions.length > 0 && (
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground font-medium" data-testid="text-total-transactions">
              {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} affichée{filteredTransactions.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
