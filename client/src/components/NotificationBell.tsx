import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useEffect, useRef } from 'react';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  metadata: any;
  createdAt: string;
  readAt: string | null;
}

export default function NotificationBell() {
  const previousCountRef = useRef<number | null>(null);
  
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 5000,
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    const currentCount = unreadData?.count || 0;
    
    if (previousCountRef.current === null) {
      previousCountRef.current = currentCount;
      return;
    }
    
    if (currentCount > previousCountRef.current) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEgxGn+DyvmwhBSl+zO/bgjMGHm7A7+OZSA0OWrLp6KRSEg==');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
    
    previousCountRef.current = currentCount;
  }, [unreadData?.count]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/notifications/${id}/read`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/notifications/read-all`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/notifications/${id}`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const unreadCount = unreadData?.count || 0;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-notification-count"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" data-testid="menu-notifications">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="h-auto p-1 text-xs"
              data-testid="button-mark-all-read"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notif.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''
                }`}
                onClick={() => !notif.isRead && markAsReadMutation.mutate(notif.id)}
                data-testid={`notification-${notif.id}`}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notif.title}</p>
                    {notif.message && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {notif.message}
                      </p>
                    )}
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{formatTime(notif.createdAt)}</p>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
