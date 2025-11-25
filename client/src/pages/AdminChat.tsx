import { useState } from "react";
import { Search, Filter, Clock, CheckCircle2, XCircle, MessageCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useAdminConversations, useAssignConversation } from "@/lib/chatQueries";
import { useUser } from "@/hooks/use-user";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ChatConversation } from "@shared/schema";

export default function AdminChat() {
  const { data: user } = useUser();
  const [, setLocation] = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allConversations = [] } = useAdminConversations();
  const assignConversationMutation = useAssignConversation();

  const filteredConversations = allConversations.filter((conv) => {
    if (statusFilter !== "all" && conv.status !== statusFilter) return false;
    if (searchQuery) {
      const userName = (conv as any).userName || conv.userId;
      const userEmail = (conv as any).userEmail || '';
      const searchLower = searchQuery.toLowerCase();
      if (!userName.toLowerCase().includes(searchLower) && 
          !userEmail.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  const handleAssignToMe = async (conversationId: string) => {
    if (!user?.id) return;

    try {
      await assignConversationMutation.mutateAsync({
        conversationId,
        adminId: user.id,
      });
    } catch (error) {
      console.error("Failed to assign conversation:", error);
    }
  };

  const selectedConversation = allConversations.find((c) => c.id === selectedConversationId);

  const openCount = allConversations.filter((c) => c.status === "open").length;
  const closedCount = allConversations.filter((c) => c.status === "closed").length;

  return (
    <div className="flex h-screen bg-background">
      <div className="w-96 border-r flex flex-col" data-testid="admin-chat-sidebar">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4" data-testid="text-admin-chat-title">
            Conversations
          </h2>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="hover-elevate">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold" data-testid="text-open-count">
                      {openCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Ouvertes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold" data-testid="text-closed-count">
                      {closedCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Fermées</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold" data-testid="text-total-count">
                      {allConversations.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-conversations"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as "all" | "open" | "closed")}
            >
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="open">Ouvertes</SelectItem>
                <SelectItem value="closed">Fermées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-muted-foreground p-6" data-testid="empty-conversations">
              <p>Aucune conversation</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversationId === conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  onAssign={() => handleAssignToMe(conversation.id)}
                  currentAdminId={user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Back Button Header */}
        <div className="border-b bg-background/50 backdrop-blur-sm p-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/admin')}
            data-testid="button-back-to-admin"
            className="rounded-lg hover:bg-muted"
            title="Retour à l'administration"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation.id}
            currentUserId={user?.id || ""}
            title={`Conversation avec ${(selectedConversation as any).userName || selectedConversation.userId}`}
            subtitle={`${(selectedConversation as any).userEmail ? `(${(selectedConversation as any).userEmail}) - ` : ''}Créée ${formatDistanceToNow(new Date(selectedConversation.createdAt), {
              addSuffix: true,
              locale: fr,
            })}`}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground" data-testid="no-conversation-selected">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Sélectionnez une conversation</p>
              <p className="text-sm">Choisissez une conversation dans la liste</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConversationCardProps {
  conversation: ChatConversation;
  isSelected: boolean;
  onClick: () => void;
  onAssign: () => void;
  currentAdminId?: string;
}

function ConversationCard({
  conversation,
  isSelected,
  onClick,
  onAssign,
  currentAdminId,
}: ConversationCardProps) {
  const isAssignedToMe = conversation.assignedAdminId === currentAdminId;

  return (
    <Card
      className={cn(
        "cursor-pointer hover-elevate active-elevate-2 transition-all",
        isSelected && "border-primary"
      )}
      onClick={onClick}
      data-testid={`conversation-card-${conversation.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate" data-testid="text-conversation-user">
              {(conversation as any).userName || conversation.userId}
            </h4>
            {(conversation as any).userEmail && (
              <p className="text-xs text-muted-foreground truncate">
                {(conversation as any).userEmail}
              </p>
            )}
            {conversation.lastMessageAt && (
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            )}
          </div>

          <Badge variant={conversation.status === "open" ? "default" : "secondary"}>
            {conversation.status === "open" ? "Ouverte" : "Fermée"}
          </Badge>
        </div>

        {conversation.assignedAdminId && (
          <div className="text-xs text-muted-foreground mb-2">
            {isAssignedToMe ? "Assignée à vous" : `Assignée à ${conversation.assignedAdminId}`}
          </div>
        )}

        {!isAssignedToMe && conversation.status === "open" && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAssign();
            }}
            className="w-full"
            data-testid="button-assign-to-me"
          >
            M'assigner
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
