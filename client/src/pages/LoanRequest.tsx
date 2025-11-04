import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getLoanOffersByAccountType, type LoanOffer } from '@shared/loan-offers';
import { useUser, getAccountTypeLabel } from '@/hooks/use-user';
import { CheckCircle, Info } from 'lucide-react';
import NewLoanDialog from '@/components/NewLoanDialog';

export default function LoanRequest() {
  const { data: user, isLoading: userLoading } = useUser();
  const [selectedOffer, setSelectedOffer] = useState<LoanOffer | null>(null);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);

  if (userLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 md:p-8">
        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors du chargement de votre profil. Veuillez vous reconnecter.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const accountType = user.accountType === 'business' ? 'business' : 'individual';
  const loanOffers = getLoanOffersByAccountType(accountType);
  const accountTypeLabel = getAccountTypeLabel(user.accountType);

  const handleRequestLoan = (offer: LoanOffer) => {
    setSelectedOffer(offer);
    setLoanDialogOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Demander un prêt
            </h1>
            <p className="text-muted-foreground">
              Découvrez les offres de prêt disponibles pour votre compte {accountTypeLabel}
            </p>
          </div>

          <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm">
              <strong>Compte {accountTypeLabel} :</strong>{' '}
              {accountType === 'individual' 
                ? 'Vous avez accès aux offres de prêt pour particuliers. Ces offres sont spécialement conçues pour vos besoins personnels.'
                : 'Vous avez accès aux offres de prêt professionnels. Ces offres sont spécialement conçues pour le développement de votre entreprise.'}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loanOffers.map((offer) => {
              const IconComponent = offer.icon;
              
              return (
                <Card 
                  key={offer.id}
                  className="hover-elevate transition-all duration-300 border-2 hover:border-primary/50"
                  data-testid={`card-loan-offer-${offer.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${offer.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${offer.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {accountTypeLabel}
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
                        <span className="text-muted-foreground">Montant</span>
                        <span className="font-semibold">{offer.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taux</span>
                        <span className="font-semibold">{offer.rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Durée</span>
                        <span className="font-semibold">{offer.duration}</span>
                      </div>
                    </div>

                    {offer.features && offer.features.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase">
                          Avantages
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
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => handleRequestLoan(offer)}
                      data-testid={`button-request-${offer.id}`}
                    >
                      Demander ce prêt
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {loanOffers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Aucune offre de prêt disponible pour votre type de compte.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <NewLoanDialog 
        open={loanDialogOpen}
        onOpenChange={setLoanDialogOpen}
      />
    </>
  );
}
