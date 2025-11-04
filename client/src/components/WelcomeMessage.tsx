import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Info, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useUser, getAccountTypeLabel } from '@/hooks/use-user';

export default function WelcomeMessage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && !user.hasSeenWelcomeMessage) {
      setIsOpen(true);
    }
  }, [user]);

  const markAsSeenMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/user/mark-welcome-seen', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsOpen(false);
    },
  });

  const handleClose = () => {
    markAsSeenMutation.mutate();
  };

  if (!user) return null;

  const accountType = user.accountType === 'business' ? 'business' : 'individual';
  const accountTypeLabel = getAccountTypeLabel(user.accountType);
  const isIndividual = accountType === 'individual';

  const individualOffers = [
    'Prêt Personnel',
    'Prêt Immobilier',
    'Crédit Auto',
    'Prêt Étudiant',
    'Prêt Vert',
    'Prêt Travaux',
  ];

  const businessOffers = [
    'Prêt Professionnel',
    'Crédit de Trésorerie',
    'Financement Équipement',
    'Prêt Immobilier Pro',
    'Ligne de Crédit',
    'Crédit Véhicule Pro',
  ];

  const availableOffers = isIndividual ? individualOffers : businessOffers;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-welcome-message">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">
              Bienvenue sur Altus Group !
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Nous sommes ravis de vous accompagner dans vos projets de financement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm ml-2">
              <strong>Votre compte : {accountTypeLabel}</strong>
              <p className="mt-2">
                {isIndividual
                  ? 'Vous avez accès aux offres de prêt pour particuliers. Ces offres sont spécialement conçues pour vos besoins personnels et projets individuels.'
                  : 'Vous avez accès aux offres de prêt professionnels. Ces offres sont spécialement conçues pour le développement et la croissance de votre entreprise.'}
              </p>
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              Offres disponibles pour vous
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableOffers.map((offer, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>{offer}</span>
                </li>
              ))}
            </ul>
          </div>

          <Alert variant="default" className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <AlertDescription className="text-sm">
              <strong>Important :</strong> Seules les offres mentionnées ci-dessus vous seront accessibles dans votre espace.
              {isIndividual
                ? ' Si vous souhaitez accéder aux offres professionnelles, vous devrez créer un compte entreprise.'
                : ' Si vous souhaitez accéder aux offres pour particuliers, vous devrez créer un compte personnel.'}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={markAsSeenMutation.isPending}
            data-testid="button-close-welcome"
          >
            {markAsSeenMutation.isPending ? 'Chargement...' : 'Compris, commencer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
