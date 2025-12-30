import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Reply, Copy, Forward, Star, Trash2 } from 'lucide-react';

interface MessageActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: {
    id: string;
    content: string;
    isOwn: boolean;
    isStarred: boolean;
  } | null;
  onReply: () => void;
  onCopy: () => void;
  onForward: () => void;
  onStar: () => void;
  onDelete: () => void;
}

const MessageActionSheet: React.FC<MessageActionSheetProps> = ({
  open,
  onOpenChange,
  message,
  onReply,
  onCopy,
  onForward,
  onStar,
  onDelete,
}) => {
  if (!message) return null;

  const actions = [
    { icon: Reply, label: 'Reply', onClick: onReply, show: true },
    { icon: Copy, label: 'Copy', onClick: onCopy, show: true },
    { icon: Forward, label: 'Forward', onClick: onForward, show: true },
    { 
      icon: Star, 
      label: message.isStarred ? 'Unstar' : 'Star', 
      onClick: onStar, 
      show: true,
      className: message.isStarred ? 'text-yellow-500' : '',
    },
    { 
      icon: Trash2, 
      label: 'Delete', 
      onClick: onDelete, 
      show: message.isOwn,
      className: 'text-destructive',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-center text-sm font-medium text-muted-foreground">
            Message Actions
          </SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {actions.filter(a => a.show).map((action) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick();
                onOpenChange(false);
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted active:scale-95 transition-all"
            >
              <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${action.className || ''}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-medium ${action.className || ''}`}>{action.label}</span>
            </button>
          ))}
        </div>
        <div className="px-2 pb-4">
          <div className="bg-muted rounded-lg p-3 max-h-20 overflow-hidden">
            <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MessageActionSheet;
