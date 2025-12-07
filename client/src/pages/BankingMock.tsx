import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle2, Clock, Lock, Shield, AlertCircle, FileText, ArrowRight, Globe, CreditCard, Banknote, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BankingMock() {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsAnimating(false);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const steps = [
    { label: 'Validation Banque Émettrice', threshold: 15, completed: progress > 15 },
    { label: 'Vérification KYC/AML', threshold: 32, completed: progress > 32 },
    { label: 'Contrôle des Fonds', threshold: 48, completed: progress > 48 },
    { label: 'Routing SWIFT/SEPA', threshold: 65, completed: progress > 65 },
    { label: 'Validation Banque Réceptrice', threshold: 82, completed: progress > 82 },
    { label: 'Finalisation', threshold: 100, completed: progress > 100 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Progression du Transfert Bancaire</h1>
          <p className="text-lg text-muted-foreground">Suivi en temps réel • Transfert International • SWIFT</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Transfer Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Card */}
            <Card className="p-8 shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-br from-primary/5 to-background">
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Montant du Transfert</p>
              <div className="flex items-baseline gap-4">
                <p className="text-6xl font-bold text-primary">275,000</p>
                <p className="text-3xl text-muted-foreground">EUR</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Équivalent: $ 298,500 USD • Frais: 45,50 EUR</p>
            </Card>

            {/* Sender & Recipient */}
            <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800">
              <div className="space-y-6">
                {/* From */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Compte Émetteur</p>
                    <p className="font-semibold text-foreground">Altus Finances Group</p>
                    <p className="text-sm text-muted-foreground mt-1">Société Générale • Luxembourg</p>
                    <p className="font-mono text-xs text-muted-foreground mt-2">LU76 1234 5678 9012 3456 7890 123</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* To */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Compte Destinataire</p>
                    <p className="font-semibold text-foreground">JPMorgan Chase Bank</p>
                    <p className="text-sm text-muted-foreground mt-1">New York • États-Unis</p>
                    <p className="font-mono text-xs text-muted-foreground mt-2">Routing: 021000021 | Account: 123456789012</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Transfer Details */}
            <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-foreground mb-4">Détails du Transfert</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Type de Réseau</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">SWIFT International</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Devise</p>
                  <p className="font-semibold text-foreground mt-2">EUR → USD</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Frais de Transfert</p>
                  <p className="font-semibold text-foreground mt-2">45,50 EUR</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Délai Estimé</p>
                  <p className="font-semibold text-foreground mt-2">2-3 jours ouvrables</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Référence</p>
                  <p className="font-mono text-sm text-foreground mt-2">TRX-2025-001847</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Date</p>
                  <p className="font-semibold text-foreground mt-2">29 nov. 2025 • 14:32 UTC</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right - Progress & Status */}
          <div className="space-y-6">
            {/* Circular Progress */}
            <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 flex flex-col items-center">
              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress / 100) * 565.48} 565.48`}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <p className="text-4xl font-bold text-primary">{Math.round(progress)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">en cours</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">Progression globale du transfert</p>
            </Card>

            {/* Linear Progress */}
            <Card className="p-4 shadow-sm border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-foreground">Avancement</p>
                <Badge variant="outline" className="text-xs">{Math.round(progress)}%</Badge>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </Card>

            {/* Status Badge */}
            <Card className="p-4 shadow-sm border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">En cours de traitement</p>
                  <p className="text-xs text-muted-foreground">Étape 4/6 en cours</p>
                </div>
              </div>
            </Card>

            {/* Compliance */}
            <Card className="p-4 shadow-sm border-slate-200 dark:border-slate-800 bg-muted/30">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">Vérification KYC validée</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">Contrôle AML complété</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">Vérification des fonds confirmée</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Steps Timeline */}
        <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-foreground mb-6">Processus de Transfert</h3>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted border border-border">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : progress > step.threshold - 18 ? (
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    step.completed ? 'text-foreground' : progress > step.threshold - 18 ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {step.completed && (
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">
                    ✓ Complété
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Security Info */}
        <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary/5 to-background">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-foreground mb-2">Sécurité Bancaire Confirmée</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ce transfert est protégé par les protocoles de sécurité bancaire internationaux les plus stricts.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Chiffrement AES-256 end-to-end</li>
                <li>✓ Authentification Multi-Facteurs validée</li>
                <li>✓ Conformité PSD2 / RGPD / OFAC</li>
                <li>✓ Audit de sécurité continu</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => setIsAnimating(!isAnimating)}
            size="sm"
            variant="outline"
            data-testid="button-pause-transfer"
          >
            {isAnimating ? '⏸ Pause' : '▶ Reprendre'}
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="button-cancel-transfer"
          >
            Annuler le Transfert
          </Button>
          <Button
            size="sm"
            variant="outline"
            data-testid="button-download-receipt"
          >
            Télécharger le Reçu
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Progression de transfert bancaire professionnel • Altus Finances Group</p>
          <p className="mt-1">Données affichées à titre de démonstration</p>
        </div>
      </div>
    </div>
  );
}
