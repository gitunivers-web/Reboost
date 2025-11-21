import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatBox } from '@/components/ChatBox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface Conversation {
  userId: string;
  fullName: string;
  unreadCount: number;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
}

export default function ChatPage() {
  const t = useTranslations();
  const { data: user } = useUser();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/chat/conversations'],
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const selectedConversation = conversations?.find(c => c.userId === selectedPartnerId);

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 p-6">
      {/* Liste des conversations */}
      <Card className="md:w-80 flex-shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.chat?.conversations || 'Conversations'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y max-h-[calc(100vh-250px)] overflow-y-auto">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <Button
                  key={conv.userId}
                  variant="ghost"
                  onClick={() => setSelectedPartnerId(conv.userId)}
                  className={`w-full p-4 h-auto justify-start ${
                    selectedPartnerId === conv.userId
                      ? 'bg-primary/10'
                      : ''
                  }`}
                  data-testid={`button-conversation-${conv.userId}`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Avatar>
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {conv.fullName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm truncate" data-testid={`text-conversation-name-${conv.userId}`}>
                          {conv.fullName}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t.chat?.noConversations || 'Aucune conversation'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Zone de chat */}
      <Card className="flex-1 flex flex-col min-h-[600px]">
        {selectedPartnerId && selectedConversation ? (
          <ChatBox
            userId={user.id}
            partnerId={selectedPartnerId}
            partnerName={selectedConversation.fullName}
          />
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t.chat?.selectConversation || 'Sélectionnez une conversation'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.chat?.selectConversationDesc || 'Choisissez une conversation pour commencer à discuter'}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
