import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, CreditCard, TrendingUp, Send, ArrowUpRight, ArrowDownLeft, Globe, Lock, Eye, EyeOff, Download, Filter } from 'lucide-react';
import { useState } from 'react';

export default function BankingMock() {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  const accounts = [
    {
      id: '1',
      label: 'Compte Principal',
      bank: 'Société Générale',
      country: 'FR',
      iban: 'FR76 1234 5678 9012 3456 7890 123',
      network: 'SEPA',
      balance: 125450.50,
      currency: 'EUR',
      isDefault: true,
      lastTransaction: '2025-11-29 14:32:00',
    },
    {
      id: '2',
      label: 'Compte International',
      bank: 'UBS',
      country: 'CH',
      iban: 'CH76 1234 5678 9012 3456 7',
      network: 'SWIFT',
      balance: 87320.00,
      currency: 'CHF',
      isDefault: false,
      lastTransaction: '2025-11-28 09:15:00',
    },
    {
      id: '3',
      label: 'Compte US',
      bank: 'Chase Bank',
      country: 'US',
      iban: 'Routing: 021000021 | Account: 123456789',
      network: 'WIRE',
      balance: 156800.75,
      currency: 'USD',
      isDefault: false,
      lastTransaction: '2025-11-27 16:45:00',
    },
    {
      id: '4',
      label: 'Compte UK',
      bank: 'HSBC',
      country: 'GB',
      iban: 'GB76 HBUK 1234 5678 9012 34',
      network: 'FASTER_PAYMENTS',
      balance: 43200.25,
      currency: 'GBP',
      isDefault: false,
      lastTransaction: '2025-11-26 11:20:00',
    },
  ];

  const transactions = [
    { id: '1', type: 'out', description: 'Transfert vers Crédit Mutuel', amount: 5000, date: '2025-11-29 14:32', network: 'SEPA', status: 'completed' },
    { id: '2', type: 'in', description: 'Versement - Contrat Professionnel', amount: 12500, date: '2025-11-28 09:15', network: 'SWIFT', status: 'completed' },
    { id: '3', type: 'out', description: 'Wire Transfer - New York', amount: 25000, date: '2025-11-27 16:45', network: 'WIRE', status: 'completed' },
    { id: '4', type: 'in', description: 'Remboursement - Intérêts', amount: 2150.50, date: '2025-11-26 11:20', network: 'SEPA', status: 'completed' },
    { id: '5', type: 'out', description: 'Paiement Fournisseur', amount: 8750, date: '2025-11-25 13:05', network: 'FASTER_PAYMENTS', status: 'completed' },
  ];

  const networkColors: Record<string, { bg: string; badge: string; icon: string }> = {
    SEPA: { bg: 'from-green-500/10 to-emerald-500/10', badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', icon: '🟢' },
    SWIFT: { bg: 'from-blue-500/10 to-cyan-500/10', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', icon: '🔵' },
    WIRE: { bg: 'from-red-500/10 to-orange-500/10', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', icon: '🔴' },
    FASTER_PAYMENTS: { bg: 'from-purple-500/10 to-pink-500/10', badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', icon: '🟣' },
    ACH: { bg: 'from-orange-500/10 to-yellow-500/10', badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300', icon: '🟠' },
    INTERAC: { bg: 'from-indigo-500/10 to-violet-500/10', badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300', icon: '🟣' },
  };

  const getNetworkLabel = (network: string) => {
    const labels: Record<string, string> = {
      SEPA: 'Virement SEPA',
      SWIFT: 'Virement SWIFT',
      WIRE: 'Wire Transfer',
      FASTER_PAYMENTS: 'Faster Payments',
      ACH: 'ACH Transfer',
      INTERAC: 'Interac e-Transfer',
    };
    return labels[network] || network;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Tableau de Bord Bancaire</h1>
          <p className="text-lg text-muted-foreground">Gestion professionnelle de vos comptes multi-devises</p>
        </div>

        {/* Total Balance Card */}
        <Card className="p-8 shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Solde Total</p>
              <div className="flex items-center gap-3">
                <p className="text-5xl font-bold text-foreground">
                  {showBalance ? '€ 412,773' : '••••••'}
                </p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  data-testid="button-toggle-balance"
                >
                  {showBalance ? (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Équivalent en EUR • Dernière mise à jour: maintenant</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="button-new-transfer">
                <Send className="w-4 h-4" />
                Nouveau virement
              </Button>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-export">
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
          </div>
        </Card>

        {/* Accounts Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">{accounts.length} Comptes Actifs</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-filter">
                <Filter className="w-4 h-4" />
                Filtrer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accounts.map((account) => {
              const colors = networkColors[account.network] || networkColors.SEPA;
              return (
                <Card
                  key={account.id}
                  className={`p-6 shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-br ${colors.bg} transition-all duration-200 hover-elevate`}
                  data-testid={`card-account-${account.id}`}
                >
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-foreground">{account.label}</h3>
                          {account.isDefault && (
                            <Badge className="bg-primary/20 text-primary text-xs">Défaut</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{account.bank}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                    </div>

                    {/* Network Badge */}
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <Badge className={`text-xs px-2.5 py-1 ${colors.badge}`}>
                        {getNetworkLabel(account.network)}
                      </Badge>
                    </div>

                    {/* Balance */}
                    <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Solde</p>
                      <p className="text-2xl font-bold text-foreground">
                        {showBalance ? formatCurrency(account.balance, account.currency) : '••••••'}
                      </p>
                    </div>

                    {/* IBAN/Details */}
                    <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/50">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">IBAN/Détails</p>
                        <p className="font-mono text-sm text-foreground break-all">{account.iban}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Dernière transaction: {new Date(account.lastTransaction).toLocaleDateString('fr-FR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <Button variant="ghost" size="sm" className="h-8" data-testid={`button-manage-${account.id}`}>
                        Gérer
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Transactions Récentes</h2>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.map((tx) => {
              const colors = networkColors[tx.network] || networkColors.SEPA;
              const isIncoming = tx.type === 'in';
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors border border-border/50 hover-elevate"
                  data-testid={`row-transaction-${tx.id}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors.badge}`}>
                    {isIncoming ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {getNetworkLabel(tx.network)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString('fr-FR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-lg ${isIncoming ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                      {isIncoming ? '+' : '-'}€ {tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {tx.status === 'completed' ? '✓ Complété' : 'En cours'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Info */}
        <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary/5 via-background to-background">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">Sécurité Bancaire</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Vos données sont protégées par le chiffrement AES-256 et l'authentification multi-niveaux.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Authentification 2FA activée</li>
                <li>✓ Conformité PSD2 / RGPD</li>
                <li>✓ Audit de sécurité quotidien</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pb-4">
          <p>Interface de gestion bancaire professionnelle • ALTUS Finances Group</p>
          <p className="mt-1">Tous les comptes et transactions affichés sont à titre de démonstration</p>
        </div>
      </div>
    </div>
  );
}
