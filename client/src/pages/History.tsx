import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, TrendingDown, Receipt, Filter } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { UserLayout } from '@/components/UserLayout';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
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
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeConfig = (type: string) => {
    const typeMap: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      credit: {
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-green-600',
        label: t.history.typeCredit,
      },
      debit: {
        icon: <TrendingDown className="h-4 w-4" />,
        color: 'text-red-600',
        label: t.history.typeDebit,
      },
      fee: {
        icon: <Receipt className="h-4 w-4" />,
        color: 'text-amber-600',
        label: t.history.typeFee,
      },
    };

    return typeMap[type] || {
      icon: <Receipt className="h-4 w-4" />,
      color: 'text-muted-foreground',
      label: type,
    };
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

  if (isLoading) {
    return (
      <UserLayout
        title={t.history.pageTitle}
        description={t.history.pageDescription}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout
      title={t.history.pageTitle}
      description={t.history.pageDescription}
    >

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {t.history.totalCredits}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600" data-testid="text-total-credit">
              {formatCurrency(totalCredit.toString())}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              {t.history.totalDebits}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600" data-testid="text-total-debit">
              {formatCurrency(totalDebit.toString())}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              {t.history.totalTransactions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-total-transactions">
              {transactions?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.history.filterTitle}</CardTitle>
          <CardDescription>{t.history.filterDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
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
                <SelectValue placeholder={t.history.filterType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.history.allTypes}</SelectItem>
                <SelectItem value="credit">{t.history.typeCredit}</SelectItem>
                <SelectItem value="debit">{t.history.typeDebit}</SelectItem>
                <SelectItem value="fee">{t.history.typeFee}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!filteredTransactions || filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.history.noTransactionsFound}</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || typeFilter !== 'all'
                ? t.history.noTransactionsFoundFiltered
                : t.history.noTransactionsYet}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t.history.pageTitle}</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const config = getTypeConfig(transaction.type);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid={`row-transaction-${transaction.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full bg-muted ${config.color}`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-mono font-semibold ${config.color}`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </UserLayout>
  );
}
