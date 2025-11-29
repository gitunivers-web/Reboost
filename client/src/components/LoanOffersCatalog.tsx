import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLoanOffersByAccountType, type LoanOffer } from '@shared/loan-offers';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useTranslations, useLanguage } from '@/lib/i18n';
import { getTranslatedLoanOffers } from '@/lib/loan-offer-i18n';
import { useUserStats } from '@/hooks/use-user-stats';

interface LoanOffersCatalogProps {
  onRequestLoan: (offer: LoanOffer) => void;
}

export default function LoanOffersCatalog({ onRequestLoan }: LoanOffersCatalogProps) {
  const t = useTranslations();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'individual' | 'business'>('individual');
  const { data: stats } = useUserStats();

  const individualOffers = getTranslatedLoanOffers(getLoanOffersByAccountType('individual'), language);
  const businessOffers = getTranslatedLoanOffers(getLoanOffersByAccountType('business'), language);
  
  const isMaxLoansReached = stats && stats.activeLoans >= stats.maxActiveLoans;

  const handleOfferClick = (offer: LoanOffer) => {
    onRequestLoan(offer);
    // Use direct navigation to ensure it works
    window.location.href = `/loan-offers/${offer.id}`;
  };

  const renderOffers = (offers: LoanOffer[], type: 'individual' | 'business') => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => {
        const IconComponent = offer.icon;
        
        return (
          <div
            key={offer.id}
            className="hover-elevate transition-all duration-300 cursor-pointer"
            onClick={() => handleOfferClick(offer)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOfferClick(offer);
              }
            }}
            data-testid={`card-loan-offer-${offer.id}`}
          >
            <Card className="h-full border-2 hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${offer.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${offer.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {type === 'individual' ? t.loanOffers.individual : t.loanOffers.business}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{offer.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {offer.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.loanOffers.amountLabel}</span>
                    <span className="font-semibold">{offer.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.loanOffers.rateLabel}</span>
                    <span className="font-semibold">{offer.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.loanOffers.durationLabel}</span>
                    <span className="font-semibold">{offer.duration}</span>
                  </div>
                </div>

                {offer.features && offer.features.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">
                      {t.loanOffers.advantagesLabel}
                    </div>
                    <ul className="space-y-1">
                      {offer.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  disabled={isMaxLoansReached}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOfferClick(offer);
                  }}
                  data-testid={`button-request-${offer.id}`}
                  title={isMaxLoansReached ? `Limite atteinte: ${stats?.activeLoans}/${stats?.maxActiveLoans} prêts actifs` : undefined}
                >
                  {t.loanOffers.requestButton}
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {stats && (
        <>
          {isMaxLoansReached && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous avez atteint le nombre maximum de prêts actifs pour votre tier <strong>{stats.tier}</strong> ({stats.activeLoans}/{stats.maxActiveLoans}). Veuillez compléter un prêt pour en demander un nouveau.
              </AlertDescription>
            </Alert>
          )}
          {!isMaxLoansReached && stats.completedLoans > 0 && stats.completedLoans < 2 && (
            <Alert className="max-w-2xl mx-auto">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Complétez {2 - stats.completedLoans} prêt(s) supplémentaire(s) pour débloquer le tier <strong>Silver</strong> et augmenter votre limite à 2 prêts actifs.
              </AlertDescription>
            </Alert>
          )}
          {!isMaxLoansReached && stats.completedLoans >= 2 && stats.completedLoans < 5 && stats.tier === 'silver' && (
            <Alert className="max-w-2xl mx-auto">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Complétez {5 - stats.completedLoans} prêt(s) supplémentaire(s) pour débloquer le tier <strong>Gold</strong> et augmenter votre limite à 3 prêts actifs.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'individual' | 'business')} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="individual" data-testid="tab-individual-loans">
            {t.loanOffers.individualTab}
          </TabsTrigger>
          <TabsTrigger value="business" data-testid="tab-business-loans">
            {t.loanOffers.businessTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-6">
          {renderOffers(individualOffers, 'individual')}
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          {renderOffers(businessOffers, 'business')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
