import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNotifications } from './NotificationBanner';
import { useTranslations } from '@/lib/i18n';
import { getApiUrl } from '@/lib/queryClient';

interface Loan {
  id: string;
  status: string;
  contractUrl?: string | null;
  signedContractUrl?: string | null;
  amount: string | number;
}

const REMINDER_INTERVAL = 60 * 60 * 1000; // 1 heure
const REMINDER_DURATION = 2 * 60 * 1000; // 2 minutes

export default function ContractNotificationManager() {
  const t = useTranslations();
  const { data: loans } = useQuery<Loan[]>({
    queryKey: ['/api/loans'],
  });
  const { addNotification, removeNotification, notifications } = useNotifications();
  const [downloadedContracts, setDownloadedContracts] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('downloaded-contracts');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('downloaded-contracts', JSON.stringify(Array.from(downloadedContracts)));
  }, [downloadedContracts]);

  useEffect(() => {
    if (!loans) return;

    const loansNeedingSignature = loans.filter(
      (loan) =>
        loan.status === 'approved' &&
        loan.contractUrl &&
        !loan.signedContractUrl &&
        !downloadedContracts.has(loan.id)
    );

    const loanIdsNeedingSignature = new Set(loansNeedingSignature.map(l => l.id));

    notifications.forEach((notification) => {
      if (notification.id.startsWith('contract-to-sign-')) {
        const loanId = notification.id.replace('contract-to-sign-', '');
        if (!loanIdsNeedingSignature.has(loanId)) {
          removeNotification(notification.id);
        }
      }
    });

    loansNeedingSignature.forEach((loan) => {
      const notificationId = `contract-to-sign-${loan.id}`;
      
      const alreadyExists = notifications.some((n) => n.id === notificationId);
      if (alreadyExists) return;

      const amount = typeof loan.amount === 'string' 
        ? parseFloat(loan.amount) 
        : loan.amount;
      
      const formattedAmount = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount);

      addNotification({
        id: notificationId,
        message: `ACTION REQUISE : Votre contrat de prêt de ${formattedAmount} est prêt ! Téléchargez-le, signez-le et retournez-le pour débloquer vos fonds.`,
        variant: 'warning',
        dismissible: false,
        link: {
          text: 'Voir le contrat',
          onClick: async () => {
            try {
              const response = await fetch(getApiUrl(`/api/contracts/${loan.id}/link`), {
                credentials: 'include',
              });

              if (!response.ok) {
                const error = await response.json();
                console.error('Erreur génération lien:', error);
                alert('Erreur lors de la génération du lien de téléchargement. Veuillez réessayer.');
                return;
              }

              const { signedUrl } = await response.json();
              
              window.open(signedUrl, '_blank');
              
              setDownloadedContracts(prev => new Set(prev).add(loan.id));
              removeNotification(notificationId);
            } catch (error) {
              console.error('Erreur téléchargement contrat:', error);
              alert('Erreur lors du téléchargement du contrat. Veuillez réessayer.');
            }
          },
        },
      });
    });
  }, [loans, addNotification, removeNotification, notifications, downloadedContracts]);

  useEffect(() => {
    if (!loans) return;

    const loansAwaitingReturn = loans.filter(
      (loan) =>
        loan.status === 'approved' &&
        loan.contractUrl &&
        !loan.signedContractUrl &&
        downloadedContracts.has(loan.id)
    );

    if (loansAwaitingReturn.length === 0) return;

    const timers: NodeJS.Timeout[] = [];

    loansAwaitingReturn.forEach((loan) => {
      const reminderKey = `reminder-last-shown-${loan.id}`;
      const lastShown = localStorage.getItem(reminderKey);
      const now = Date.now();

      const shouldShowReminder = !lastShown || (now - parseInt(lastShown)) >= REMINDER_INTERVAL;

      if (shouldShowReminder) {
        const notificationId = `contract-reminder-${loan.id}`;
        
        const amount = typeof loan.amount === 'string' 
          ? parseFloat(loan.amount) 
          : loan.amount;
        
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(amount);

        addNotification({
          id: notificationId,
          message: `RAPPEL : N'oubliez pas de retourner votre contrat de prêt signé de ${formattedAmount} pour débloquer vos fonds.`,
          variant: 'warning',
          dismissible: true,
          link: {
            text: 'Voir mes contrats',
            onClick: () => {
              window.location.href = '/contracts';
            },
          },
        });

        localStorage.setItem(reminderKey, now.toString());

        const removeTimer = setTimeout(() => {
          removeNotification(notificationId);
        }, REMINDER_DURATION);

        timers.push(removeTimer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [loans, downloadedContracts, addNotification, removeNotification]);

  return null;
}
