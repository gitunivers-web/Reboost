import { X, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  message: string;
  variant: NotificationVariant;
  dismissible: boolean;
  link?: {
    text: string;
    href: string;
  };
}

interface NotificationStore {
  notifications: Notification[];
  dismissedIds: string[];
  dismissNotification: (id: string) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

export const useNotifications = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [
        {
          id: 'welcome-2025',
          message: '🎉 Nouveau : Tableau d\'amortissement interactif disponible ! Simulez vos remboursements en temps réel.',
          variant: 'info',
          dismissible: true,
          link: {
            text: 'Découvrir',
            href: '/loans',
          },
        },
      ],
      dismissedIds: [],
      dismissNotification: (id) =>
        set((state) => ({
          dismissedIds: [...state.dismissedIds, id],
        })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'notification-storage',
    }
  )
);

const variantStyles: Record<NotificationVariant, { bg: string; text: string; border: string; icon: typeof Info }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-900 dark:text-blue-100',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-900 dark:text-green-100',
    border: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    text: 'text-yellow-900 dark:text-yellow-100',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertTriangle,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-900 dark:text-red-100',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
  },
};

export default function NotificationBanner() {
  const { notifications, dismissedIds, dismissNotification } = useNotifications();

  const activeNotifications = notifications.filter(
    (notification) => !dismissedIds.includes(notification.id)
  );

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {activeNotifications.map((notification) => {
        const styles = variantStyles[notification.variant];
        const Icon = styles.icon;

        return (
          <div
            key={notification.id}
            className={`${styles.bg} ${styles.text} ${styles.border} border px-4 py-3 flex items-center justify-between gap-4`}
            data-testid={`notification-banner-${notification.id}`}
          >
            <div className="flex items-center gap-3 flex-1">
              <Icon className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{notification.message}</p>
              {notification.link && (
                <a
                  href={notification.link.href}
                  className="text-sm font-semibold underline hover:no-underline whitespace-nowrap"
                  data-testid={`link-notification-${notification.id}`}
                >
                  {notification.link.text} →
                </a>
              )}
            </div>
            {notification.dismissible && (
              <button
                onClick={() => dismissNotification(notification.id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                aria-label="Dismiss notification"
                data-testid={`button-dismiss-${notification.id}`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
