import { useEffect } from 'react';
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

export default function ContractNotificationManager() {
  const t = useTranslations();
  const { data: loans } = useQuery<Loan[]>({
    queryKey: ['/api/loans'],
  });
  const { addNotification, removeNotification, notifications } = useNotifications();

  useEffect(() => {
    if (!loans) return;

    const loansNeedingSignature = loans.filter(
      (loan) =>
        loan.status === 'approved' &&
        loan.contractUrl &&
        !loan.signedContractUrl
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
          onClick: () => {
            const contractUrl = getApiUrl(`/api/loans/${loan.id}/contract`);
            window.open(contractUrl, '_blank');
          },
        },
      });
    });
  }, [loans, addNotification, removeNotification, notifications]);

  return null;
}
