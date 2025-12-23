import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Copy, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, generateId, formatTime, addMessage, getMessages } from "@/lib/chatUtils";
import { toast } from "sonner";

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

  useEffect(() => {
    // Load existing messages
    const existingMessages = getMessages(sessionCode);
    
    // Add join message
    const joinMessage: Message = {
      id: generateId(),
      sender: "System",
      content: `${userName} joined the chat`,
      timestamp: new Date(),
      isOwn: false,
    };
    
    addMessage(sessionCode, joinMessage);
    setMessages([...existingMessages, joinMessage]);
    
    // Focus input
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: generateId(),
      sender: userName,
      content: newMessage.trim(),
      timestamp: new Date(),
      isOwn: true,
    };

    addMessage(sessionCode, message);
    setMessages(prev => [...prev, message]);
    setNewMessage("");
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
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="glass-card rounded-none rounded-b-2xl p-4 flex items-center justify-between animate-slide-up">
        <Button variant="ghost" size="icon" onClick={onLeave}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Session</p>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-primary tracking-wider">
                {sessionCode}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-accent" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">Live</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === "System"
                  ? "bg-secondary/50 text-muted-foreground text-center text-sm mx-auto"
                  : message.isOwn
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "glass-card rounded-bl-md"
              }`}
            >
              {message.sender !== "System" && !message.isOwn && (
                <p className="text-xs text-accent font-semibold mb-1">
                  {message.sender}
                </p>
              )}
              <p className="break-words">{message.content}</p>
              {message.sender !== "System" && (
                <p className={`text-xs mt-1 ${message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatTime(message.timestamp)}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 glass-card rounded-none rounded-t-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">Chatting as</span>
          <span className="text-xs font-semibold text-accent">{userName}</span>
        </div>
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            variant="hero" 
            size="icon" 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
