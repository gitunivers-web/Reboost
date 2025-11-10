import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ArrowRightLeft, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from '@/lib/i18n';
import { UserLayout } from '@/components/UserLayout';

interface Transfer {
  id: string;
  amount: string;
  recipient: string;
  status: string;
  currentStep: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export default function Transfers() {
  const t = useTranslations();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: transfers, isLoading } = useQuery<Transfer[]>({
    queryKey: ['/api/transfers'],
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: t.transfer.pending, variant: 'secondary' },
      'in-progress': { label: t.transfer.inProgress, variant: 'default' },
      completed: { label: t.transfer.completed, variant: 'outline' },
      suspended: { label: t.transfer.suspended, variant: 'destructive' },
    };

    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredTransfers = transfers?.filter((transfer) => {
    const matchesSearch = transfer.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          transfer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <UserLayout
        title={t.transfer.pageTitle}
        description={t.transfer.pageDescription}
      >
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout
      title={t.transfer.pageTitle}
      description={t.transfer.pageDescription}
      actions={
        <Button
          size="lg"
          onClick={() => setLocation('/transfer/new')}
          data-testid="button-new-transfer"
        >
          <Plus className="mr-2 h-5 w-5" />
          {t.transfer.newTransfer}
        </Button>
      }
    >

      <Card>
        <CardHeader>
          <CardTitle>{t.transfer.filterTitle}</CardTitle>
          <CardDescription>{t.transfer.filterDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.transfer.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-transfers"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-status-filter">
                <SelectValue placeholder={t.loan.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.transfer.allStatuses}</SelectItem>
                <SelectItem value="pending">{t.transfer.pending}</SelectItem>
                <SelectItem value="in-progress">{t.transfer.inProgress}</SelectItem>
                <SelectItem value="completed">{t.transfer.completed}</SelectItem>
                <SelectItem value="suspended">{t.transfer.suspended}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!filteredTransfers || filteredTransfers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ArrowRightLeft className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.transfer.noTransfersFound}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter !== 'all'
                ? t.transfer.noTransfersMessage
                : t.transfer.noTransfersMessage}
            </p>
            <Button onClick={() => setLocation('/transfer/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {t.transfer.createTransfer}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransfers.map((transfer) => (
            <Card
              key={transfer.id}
              className="hover-elevate cursor-pointer transition-all"
              onClick={() => setLocation(`/transfer/${transfer.id}`)}
              data-testid={`card-transfer-${transfer.id}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{transfer.recipient}</h3>
                      {getStatusBadge(transfer.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ID: {transfer.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Créé {formatDistanceToNow(new Date(transfer.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-2xl font-mono font-semibold">
                      {formatCurrency(transfer.amount)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${transfer.progressPercent}%` }}
                        />
                      </div>
                      <span>{transfer.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTransfers && filteredTransfers.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Affichage de {filteredTransfers.length} transfert{filteredTransfers.length > 1 ? 's' : ''}
          {transfers && filteredTransfers.length < transfers.length && ` sur ${transfers.length}`}
        </div>
      )}
    </UserLayout>
  );
}
