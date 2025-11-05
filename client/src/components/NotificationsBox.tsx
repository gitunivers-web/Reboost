import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Bell, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface AdminMessage {
  id: string;
  subject: string;
  content: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  deliveredAt: string;
}

export default function NotificationsBox() {
  const { data: messages, isLoading } = useQuery<AdminMessage[]>({
    queryKey: ['/api/messages'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/messages/${id}/read`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const unreadCount = messages?.filter(m => !m.isRead).length || 0;

  return (
    <Card className="shadow-sm border bg-white dark:bg-slate-800" data-testid="card-notifications">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 text-xs" data-testid="badge-unread-count">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            <ScrollArea className="h-[220px]">
              <div className="space-y-2" data-testid="list-notifications">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-md border text-sm transition-all ${
                      message.isRead 
                        ? 'bg-muted/30 border-muted' 
                        : 'bg-background border-primary/30'
                    }`}
                    data-testid={`notification-${message.id}`}
                  >
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(message.severity)}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-xs">{message.subject}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.deliveredAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {!message.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs px-2"
                          onClick={() => markAsReadMutation.mutate(message.id)}
                          disabled={markAsReadMutation.isPending}
                          data-testid={`button-mark-read-${message.id}`}
                        >
                          Lu
                        </Button>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 ${getSeverityColor(message.severity)}`}
                    >
                      {message.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune notification</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
