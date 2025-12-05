import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Lock, Building, Shield, Globe, Banknote, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProgressMock() {
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
        return prev + Math.random() * 15;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const steps = [
    { label: 'Initialisation', threshold: 17, completed: progress > 17 },
    { label: 'Contrôle KYC', threshold: 33, completed: progress > 33 },
    { label: 'Vérification des fonds', threshold: 50, completed: progress > 50 },
    { label: 'Validation bancaire', threshold: 67, completed: progress > 67 },
    { label: 'Finalisation', threshold: 84, completed: progress > 84 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Progression du Transfert</h1>
          <p className="text-lg text-muted-foreground">Vue complète en temps réel</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transfer Info & Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transfer Info Card */}
            <Card className="p-8 shadow-sm border-slate-200 dark:border-slate-800">
              <div className="space-y-6">
                {/* Amount */}
                <div className="text-center pb-6 border-b border-border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Montant du transfert</p>
                  <p className="text-6xl font-bold text-foreground">
                    50,000<span className="text-3xl ml-2">€</span>
                  </p>
                </div>

                {/* Sender */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Expéditeur</p>
                    <p className="text-base font-semibold text-foreground">Solventis Group</p>
                  </div>
                </div>

                {/* Recipient */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Destinataire</p>
                    <p className="text-base font-semibold text-foreground">Société Générale - Compte Professionnel</p>
                  </div>
                </div>

                {/* Reference */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Référence</p>
                    <p className="text-sm font-mono font-semibold text-foreground break-all">TRX-2025-001847</p>
                  </div>
                </div>

                {/* Network Type */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Type de transfert</p>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-foreground">Virement International SWIFT</p>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                          Prioritaire
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          3-5 jours ouvrables
                        </span>
                        <span className="flex items-center gap-1">
                          <Banknote className="w-3 h-3" />
                          45,50 EUR
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Steps Card */}
            <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-foreground mb-4">Étapes de traitement</h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="mt-0.5">
                      {step.completed ? (
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                        </div>
                      ) : progress > step.threshold - 15 ? (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        step.completed 
                          ? 'text-foreground' 
                          : progress > step.threshold - 15
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Progress & Security */}
          <div className="space-y-6">
            {/* Circular Progress */}
            <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress / 100) * 565.48} 565.48`}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <p className="text-4xl font-bold text-primary">{Math.round(progress)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">en cours</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">Progression du transfert</p>
            </Card>

            {/* Linear Progress Bar */}
            <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-foreground">Avancement global</p>
                  <Badge variant="outline" className="text-xs">{Math.round(progress)}%</Badge>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Security Info */}
            <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 bg-muted/30 space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Protocoles sécurisés</p>
                  <p className="text-xs text-muted-foreground mt-1">AES-256 + Authentification Multi-Niveaux</p>
                </div>
              </div>
            </Card>

            {/* Live Updates */}
            <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-sm font-semibold text-foreground">Dernière mise à jour</p>
              <p className="text-xs text-muted-foreground">à l'instant</p>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Transfert ID: TRX-2025-001847</p>
                <p className="text-xs text-muted-foreground mt-1">Créé: 29 nov. 2025 à 04:15 UTC</p>
              </div>
            </Card>

            {/* Control Button */}
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              {isAnimating ? 'Pause' : 'Reprendre'}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Ceci est une démonstration de la page de progression de transfert</p>
        </div>
      </div>
    </div>
  );
}
