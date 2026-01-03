import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Copy, Check, MessageCircle, Smile, Pencil, Users, Paperclip, X, FileText, Download, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, formatTime, addMessage, getMessages, uploadFile } from "@/lib/chatUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { useMessageReads } from "@/hooks/useMessageReads";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MessageReactionsComponent from "./MessageReactions";

interface ChatRoomProps {
  sessionCode: string;
  userName: string;
  onLeave: () => void;
  onNameChange?: (newName: string) => void;
}

const ChatRoom = ({ sessionCode, userName, onLeave, onNameChange }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState(userName);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { typingText, handleTyping, stopTyping } = useTypingIndicator(sessionCode, userName);
  const { reactions, toggleReaction } = useMessageReactions(sessionCode, userName);
  const { onlineUsers, onlineCount } = useOnlineUsers(sessionCode, userName);
  const { markAsRead, getReadersForMessage } = useMessageReads(sessionCode, userName);
  const { theme } = useTheme();

  // Mark messages as read when they come into view
  useEffect(() => {
    messages.forEach(msg => {
      if (!msg.isSystem && !msg.isOwn) {
        markAsRead(msg.id, msg.sender);
      }
    });
  }, [messages, markAsRead]);

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
            file_url?: string;
            file_type?: string;
            file_name?: string;
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
              isSystem: newMsg.is_system,
              fileUrl: newMsg.file_url,
              fileType: newMsg.file_type,
              fileName: newMsg.file_name
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

  const MAX_MESSAGE_LENGTH = 5000;

  const handleSend = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    const content = newMessage.trim();
    
    if (content.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }
    
    setNewMessage("");
    stopTyping();
    
    let fileData = null;
    if (selectedFile) {
      setIsUploading(true);
      fileData = await uploadFile(sessionCode, selectedFile);
      setIsUploading(false);
      setSelectedFile(null);
      
      if (!fileData) {
        toast.error("Failed to upload file");
        return;
      }
    }
    
    const success = await addMessage(
      sessionCode, 
      userName, 
      content || (fileData ? `Shared ${fileData.name}` : ""), 
      false,
      fileData?.url,
      fileData?.type,
      fileData?.name
    );
    if (!success) {
      toast.error("Failed to send message");
    }
  };

  // Allowed MIME types for file uploads
  const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'doc', 'docx'];
  
  // Sanitize filename to prevent path traversal attacks
  const sanitizeFilename = (name: string): string => {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error("File type not allowed. Allowed: images, PDF, TXT, DOC");
        return;
      }
      
      // Validate file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        toast.error("File extension not allowed");
        return;
      }
      
      // Create a new file with sanitized name
      const sanitizedName = sanitizeFilename(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      
      // Show privacy warning for file uploads
      toast.warning("Files uploaded are publicly accessible during the session. Avoid uploading sensitive documents.", {
        duration: 5000,
      });
      
      setSelectedFile(sanitizedFile);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const isImageFile = (type?: string) => type?.startsWith('image/');

  const renderFilePreview = (message: Message) => {
    if (!message.fileUrl) return null;
    
    if (isImageFile(message.fileType)) {
      return (
        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
          <img 
            src={message.fileUrl} 
            alt={message.fileName || 'Shared image'} 
            className="max-w-full max-h-48 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
          />
        </a>
      );
    }
    
    return (
      <a 
        href={message.fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${message.isOwn ? 'bg-white/20' : 'bg-muted'} hover:opacity-80 transition-opacity`}
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span className="text-xs truncate flex-1">{message.fileName || 'File'}</span>
        <Download className="w-3 h-3 shrink-0" />
      </a>
    );
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
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setEmojiOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 flex flex-col liquid-bg">
      {/* Header */}
      <header className="liquid-glass px-3 sm:px-4 py-3 flex items-center justify-between animate-slide-up flex-shrink-0 rounded-none border-b border-border/50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onLeave}
          className="hover:bg-destructive/10 hover:text-destructive h-9 w-9 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md shadow-primary/30">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Chutkii Room</p>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-mono font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tracking-[0.15em] sm:tracking-[0.2em] text-base sm:text-lg">
                {sessionCode}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-primary/10"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-pointer">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{onlineCount}</span>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px]">
              <p className="font-semibold text-xs mb-1">Online Users</p>
              <div className="space-y-0.5">
                {onlineUsers.map((user, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground">
                    {user.name === userName ? `${user.name} (You)` : user.name}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </header>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 overscroll-contain">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <p className="font-medium text-sm sm:text-base">No messages yet</p>
            <p className="text-xs sm:text-sm">Start the conversation!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? "justify-end" : "justify-start"} animate-fade-in group`}
          >
            <div className="max-w-[85%] sm:max-w-[80%]">
              <div
                className={`rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                  message.isSystem
                    ? "bg-muted text-muted-foreground text-center text-xs sm:text-sm mx-auto rounded-lg sm:rounded-xl"
                    : message.isOwn
                    ? "bg-gradient-to-br from-primary to-accent text-white rounded-br-sm sm:rounded-br-md shadow-md"
                    : "bg-card border border-border rounded-bl-sm sm:rounded-bl-md shadow-sm"
                }`}
              >
                {!message.isSystem && !message.isOwn && (
                  <p className="text-[10px] sm:text-xs text-primary font-semibold mb-0.5 sm:mb-1">
                    {message.sender}
                  </p>
                )}
                <p className="break-words text-sm sm:text-base">{message.content}</p>
                {renderFilePreview(message)}
                {!message.isSystem && (
                  <div className={`flex items-center gap-1 mt-0.5 sm:mt-1 ${message.isOwn ? "justify-end" : ""}`}>
                    <p className={`text-[10px] sm:text-xs ${message.isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                      {formatTime(message.timestamp)}
                    </p>
                    {message.isOwn && (
                      <span className="inline-flex">
                        {getReadersForMessage(message.id, message.sender).length > 0 ? (
                          <CheckCheck className="w-3 h-3 text-blue-300" />
                        ) : (
                          <Check className="w-3 h-3 text-white/70" />
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {!message.isSystem && (
                <MessageReactionsComponent
                  messageId={message.id}
                  reactions={reactions[message.id] || []}
                  userName={userName}
                  onToggleReaction={toggleReaction}
                  isOwn={message.isOwn || false}
                />
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {typingText && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl rounded-bl-sm sm:rounded-bl-md px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">{typingText}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 liquid-glass flex-shrink-0 rounded-none border-t border-border/50 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs text-muted-foreground">Chatting as</span>
          <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
            <DialogTrigger asChild>
              <button 
                className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                onClick={() => setEditingName(userName)}
              >
                <span className="truncate max-w-[100px] sm:max-w-[150px]">{userName}</span>
                <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-gradient-chutki">Change Your Name</DialogTitle>
                <DialogDescription>
                  Enter a new display name for this chat session.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Enter new name..."
                  maxLength={50}
                  className="h-11"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setNameDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
                    onClick={() => {
                      if (editingName.trim() && editingName.trim() !== userName) {
                        onNameChange?.(editingName.trim());
                        setNameDialogOpen(false);
                      } else if (editingName.trim() === userName) {
                        setNameDialogOpen(false);
                      } else {
                        toast.error("Please enter a valid name");
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Selected file preview */}
        {selectedFile && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-lg">
            {selectedFile.type.startsWith('image/') ? (
              <img 
                src={URL.createObjectURL(selectedFile)} 
                alt="Preview" 
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <FileText className="w-10 h-10 p-2 bg-primary/10 rounded text-primary" />
            )}
            <span className="text-xs truncate flex-1">{selectedFile.name}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setSelectedFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <div className="flex gap-1.5 sm:gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl hover:bg-primary/10 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </Button>
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl hover:bg-primary/10 shrink-0"
              >
                <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align="start" 
              className="w-auto p-0 border-none shadow-lg"
            >
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                width={280}
                height={350}
              />
            </PopoverContent>
          </Popover>
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
            maxLength={5000}
            className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl border-border focus:border-primary text-sm sm:text-base"
          />
          <Button 
            onClick={handleSend}
            disabled={(!newMessage.trim() && !selectedFile) || isUploading}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent hover:opacity-90 text-white shadow-md disabled:opacity-50 shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
