import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, TrendingDown, Receipt, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
}

function HistorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
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
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <HistorySkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.history.pageTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.history.pageDescription}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.history.totalCredits}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-accent" data-testid="text-total-credit">
            +{formatCurrency(totalCredit.toString())}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.history.totalDebits}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-destructive" data-testid="text-total-debit">
            -{formatCurrency(totalDebit.toString())}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solde net</p>
            </div>
          </div>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-accent' : 'text-destructive'}`} data-testid="text-net-balance">
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance.toString())}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.history.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-history"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-type-filter">
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
      </Card>

      {/* Transactions List */}
      {!filteredTransactions || filteredTransactions.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.history.noTransactionsFound}</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || typeFilter !== 'all'
                ? t.history.noTransactionsYet
                : t.history.noTransactionsYet}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover-elevate transition-all"
                data-testid={`transaction-item-${transaction.id}`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-accent/10' :
                      transaction.type === 'debit' ? 'bg-destructive/10' :
                      'bg-muted'
                    }`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                  </div>

                  {/* Transaction Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{transaction.description}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(transaction.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-xl font-semibold font-mono ${
                      transaction.type === 'credit' ? 'text-accent' :
                      transaction.type === 'debit' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {transaction.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Total Transactions Count */}
      {filteredTransactions && filteredTransactions.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-total-transactions">
            {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} affichée{filteredTransactions.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
