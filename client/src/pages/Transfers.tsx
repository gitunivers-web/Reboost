import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ArrowUpRight, Search, Send, Clock, CheckCircle2, XCircle, Pause } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from '@/lib/i18n';

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

function TransfersSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-accent" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-muted-foreground" />;
      case 'in-progress':
        return <Send className="w-5 h-5 text-primary" />;
      case 'suspended':
        return <Pause className="w-5 h-5 text-destructive" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Send className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: t.transfer.pending, variant: 'secondary' },
      'in-progress': { label: t.transfer.inProgress, variant: 'default' },
      completed: { label: t.transfer.completed, variant: 'outline' },
      suspended: { label: t.transfer.suspended, variant: 'destructive' },
      rejected: { label: 'Rejeté', variant: 'destructive' },
    };

    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const filteredTransfers = transfers?.filter((transfer) => {
    const matchesSearch = transfer.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          transfer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <TransfersSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.transfer.pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.transfer.pageDescription}</p>
        </div>
        <Button
          onClick={() => setLocation('/transfer/new')}
          className="gap-2"
          data-testid="button-new-transfer"
        >
          <Plus className="w-4 h-4" />
          {t.transfer.newTransfer}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
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
      </Card>

      {/* Stats Overview */}
      {transfers && transfers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{transfers.length}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold text-foreground">
                {transfers.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">En cours</p>
              <p className="text-2xl font-bold text-primary">
                {transfers.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Terminés</p>
              <p className="text-2xl font-bold text-accent">
                {transfers.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Transfers List */}
      {!filteredTransfers || filteredTransfers.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.transfer.noTransfersFound}</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              {searchQuery || statusFilter !== 'all'
                ? t.transfer.noTransfersMessage
                : t.transfer.noTransfersMessage}
            </p>
            <Button onClick={() => setLocation('/transfer/new')} data-testid="button-create-first-transfer">
              <Plus className="mr-2 h-4 w-4" />
              {t.transfer.createTransfer}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransfers.map((transfer) => (
            <Card
              key={transfer.id}
              className="p-4 hover-elevate cursor-pointer transition-all"
              onClick={() => setLocation(`/transfer/${transfer.id}`)}
              data-testid={`card-transfer-${transfer.id}`}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                    {getStatusIcon(transfer.status)}
                  </div>
                </div>

                {/* Transfer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{transfer.recipient}</h3>
                    {getStatusBadge(transfer.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>ID: {transfer.id.slice(0, 8)}...</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(transfer.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  {transfer.status === 'in-progress' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progression</span>
                        <span>{transfer.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${transfer.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xl font-semibold text-foreground font-mono">
                    {formatCurrency(transfer.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Étape {transfer.currentStep}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
