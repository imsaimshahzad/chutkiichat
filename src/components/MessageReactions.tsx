import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Reaction } from "@/hooks/useMessageReactions";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  userName: string;
  onToggleReaction: (messageId: string, emoji: string) => void;
  isOwn: boolean;
}

const MessageReactions = ({
  messageId,
  reactions,
  userName,
  onToggleReaction,
  isOwn
}: MessageReactionsProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleQuickReaction = (emoji: string) => {
    onToggleReaction(messageId, emoji);
    setPickerOpen(false);
  };

  return (
    <div className={`flex items-center gap-1 mt-1 flex-wrap ${isOwn ? "justify-end" : "justify-start"}`}>
      {/* Existing reactions */}
      {reactions.map((reaction) => {
        const hasReacted = reaction.users.includes(userName);
        return (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onToggleReaction(messageId, reaction.emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                  hasReacted
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-muted hover:bg-muted/80 border border-transparent"
                }`}
              >
                <span>{reaction.emoji}</span>
                <span className={hasReacted ? "text-primary font-medium" : "text-muted-foreground"}>
                  {reaction.count}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {reaction.users.join(", ")}
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Add reaction button */}
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <SmilePlus className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align={isOwn ? "end" : "start"} 
          className="w-auto p-2"
        >
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleQuickReaction(emoji)}
                className="text-xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;
