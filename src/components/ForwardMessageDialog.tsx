import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Check } from 'lucide-react';
import { Conversation } from '@/hooks/useConversations';

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: Conversation[];
  onForward: (conversationId: string) => void;
  loading?: boolean;
}

const ForwardMessageDialog: React.FC<ForwardMessageDialogProps> = ({
  open,
  onOpenChange,
  conversations,
  onForward,
  loading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.is_group 
      ? conv.group_name || 'Group Chat'
      : conv.participants[0]?.display_name || conv.participants[0]?.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getConversationName = (conv: Conversation) => {
    if (conv.is_group) return conv.group_name || 'Group Chat';
    return conv.participants[0]?.display_name || conv.participants[0]?.username || 'Unknown';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.is_group) return conv.group_avatar;
    return conv.participants[0]?.avatar_url;
  };

  const handleForward = () => {
    if (selectedId) {
      onForward(selectedId);
      setSelectedId(null);
      setSearchQuery('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) {
        setSelectedId(null);
        setSearchQuery('');
      }
      onOpenChange(o);
    }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Forward Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-[250px]">
            {filteredConversations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No conversations found</p>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedId === conv.id ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getConversationAvatar(conv) || ''} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getConversationName(conv)[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium truncate">{getConversationName(conv)}</span>
                    {selectedId === conv.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <Button 
            onClick={handleForward} 
            disabled={!selectedId || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Forwarding...
              </>
            ) : (
              'Forward'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForwardMessageDialog;
