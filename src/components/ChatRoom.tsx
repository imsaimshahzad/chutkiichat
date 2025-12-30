import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Copy, Check, Users, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, formatTime, addMessage, getMessages } from "@/lib/chatUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

interface ChatRoomProps {
  sessionCode: string;
  userName: string;
  onLeave: () => void;
}

const ChatRoom = ({ sessionCode, userName, onLeave }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { typingText, handleTyping, stopTyping } = useTypingIndicator(sessionCode, userName);

  useEffect(() => {
    console.log('ChatRoom mounted for session:', sessionCode, 'user:', userName);
    
    const loadMessages = async () => {
      console.log('Loading messages for session:', sessionCode);
      const existingMessages = await getMessages(sessionCode);
      console.log('Loaded messages:', existingMessages);
      
      const messagesWithOwnership = existingMessages.map(msg => ({
        ...msg,
        isOwn: msg.sender === userName
      }));
      setMessages(messagesWithOwnership);
      
      const success = await addMessage(sessionCode, "System", `${userName} joined the chat`, true);
      console.log('Join message added:', success);
    };
    
    loadMessages();
    inputRef.current?.focus();

    console.log('Setting up realtime subscription for session:', sessionCode);
    const channel = supabase
      .channel(`messages-${sessionCode}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_code=eq.${sessionCode}`
        },
        (payload) => {
          console.log('Realtime message received:', payload);
          const newMsg = payload.new as {
            id: string;
            sender: string;
            content: string;
            is_system: boolean;
            created_at: string;
          };
          
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) {
              console.log('Message already exists, skipping:', newMsg.id);
              return prev;
            }
            
            console.log('Adding new message to state:', newMsg);
            return [...prev, {
              id: newMsg.id,
              sender: newMsg.sender,
              content: newMsg.content,
              timestamp: new Date(newMsg.created_at),
              isOwn: newMsg.sender === userName,
              isSystem: newMsg.is_system
            }];
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [sessionCode, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");
    stopTyping();
    
    const success = await addMessage(sessionCode, userName, content, false);
    if (!success) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex items-center justify-between animate-slide-up shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onLeave}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Chutki Room</p>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-gradient-chutki tracking-[0.2em] text-lg">
                {sessionCode}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 hover:bg-primary/10"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-primary" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Live</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.isSystem
                  ? "bg-muted text-muted-foreground text-center text-sm mx-auto rounded-xl"
                  : message.isOwn
                  ? "bg-gradient-to-br from-primary to-accent text-white rounded-br-md shadow-md"
                  : "bg-card border border-border rounded-bl-md shadow-sm"
              }`}
            >
              {!message.isSystem && !message.isOwn && (
                <p className="text-xs text-primary font-semibold mb-1">
                  {message.sender}
                </p>
              )}
              <p className="break-words">{message.content}</p>
              {!message.isSystem && (
                <p className={`text-xs mt-1 ${message.isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                  {formatTime(message.timestamp)}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {typingText && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted-foreground">{typingText}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">Chatting as</span>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{userName}</span>
        </div>
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (e.target.value.trim()) {
                handleTyping();
              }
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 h-12 rounded-xl border-border focus:border-primary"
          />
          <Button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent hover:opacity-90 text-white shadow-md disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
