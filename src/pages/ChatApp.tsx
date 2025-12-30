import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, Conversation } from '@/hooks/useConversations';
import { useChatMessages, ChatMessage } from '@/hooks/useChatMessages';
import { useContacts } from '@/hooks/useContacts';
import { useAllUsers } from '@/hooks/useAllUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  MessageCircle,
  Send,
  Search,
  Menu,
  LogOut,
  UserPlus,
  Settings,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Loader2,
  Users,
  Shield,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ChatApp = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin } = useAuth();
  const { conversations, loading: convsLoading, createConversation } = useConversations();
  const { contacts, searchUsers, addContact } = useContacts();
  const { users: allUsers, loading: usersLoading } = useAllUsers();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { messages, loading: msgsLoading, sendMessage } = useChatMessages(selectedConversation?.id || null);
  
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleStartChat = async (userId: string) => {
    const conversationId = await createConversation(userId);
    if (conversationId) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
      setIsNewChatOpen(false);
      setShowMobileChat(true);
    }
  };

  const handleAddContact = async (userId: string) => {
    const { error } = await addContact(userId);
    if (error) {
      toast.error('Failed to add contact');
    } else {
      toast.success('Contact added!');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput('');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'HH:mm');
  };

  const formatConversationTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'dd/MM/yyyy');
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.is_group) return conv.group_name || 'Group Chat';
    return conv.participants[0]?.display_name || conv.participants[0]?.username || 'Unknown';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.is_group) return conv.group_avatar;
    return conv.participants[0]?.avatar_url;
  };

  const isParticipantOnline = (conv: Conversation) => {
    if (conv.is_group) return false;
    return conv.participants[0]?.is_online || false;
  };

  // Sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between bg-card flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.display_name?.[0] || profile?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{profile?.display_name || profile?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/admin')} 
              title="Admin Panel"
              className="h-10 w-10 active:scale-95 transition-transform"
            >
              <Shield className="h-5 w-5 text-primary" />
            </Button>
          )}
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 active:scale-95 transition-transform">
                <UserPlus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  {isSearching || usersLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    // Show search results
                    searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                          >
                            <div className="flex items-center gap-3" onClick={() => handleStartChat(user.id)}>
                              <Avatar>
                                <AvatarImage src={user.avatar_url || ''} />
                                <AvatarFallback>{user.display_name?.[0] || user.username[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.display_name || user.username}</p>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddContact(user.id);
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    )
                  ) : (
                    // Show all users by default
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">All Users</p>
                      {allUsers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No users available</p>
                      ) : (
                        allUsers.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                          >
                            <div className="flex items-center gap-3 flex-1" onClick={() => handleStartChat(u.id)}>
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src={u.avatar_url || ''} />
                                  <AvatarFallback>{u.display_name?.[0] || u.username[0]}</AvatarFallback>
                                </Avatar>
                                {u.is_online && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{u.display_name || u.username}</p>
                                <p className="text-sm text-muted-foreground">@{u.username}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddContact(u.id);
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-10 w-10 active:scale-95 transition-transform">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {convsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No Chats Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start a new conversation with someone!</p>
            <Button onClick={() => setIsNewChatOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center gap-3 p-3 sm:p-4 cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-muted' : ''
                }`}
                onClick={() => {
                  setSelectedConversation(conv);
                  setShowMobileChat(true);
                }}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getConversationAvatar(conv) || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {conv.is_group ? <Users className="h-5 w-5" /> : getConversationName(conv)[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isParticipantOnline(conv) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-foreground truncate">{getConversationName(conv)}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {conv.last_message && formatConversationTime(conv.last_message.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message?.content || 'No messages yet'}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // Chat area content
  const ChatArea = () => (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {selectedConversation ? (
        <>
          {/* Chat Header */}
          <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between bg-card flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 active:scale-95 transition-transform"
                onClick={() => setShowMobileChat(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getConversationAvatar(selectedConversation) || ''} />
                  <AvatarFallback>{getConversationName(selectedConversation)[0]}</AvatarFallback>
                </Avatar>
                {isParticipantOnline(selectedConversation) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">{getConversationName(selectedConversation)}</p>
                <p className="text-xs text-muted-foreground">
                  {isParticipantOnline(selectedConversation) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button variant="ghost" size="icon" className="h-10 w-10 hidden sm:flex">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 hidden sm:flex">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {msgsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">No messages yet. Say hi!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          <span className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {formatMessageTime(msg.created_at)}
                          </span>
                          {isOwn && (
                            msg.is_read ? (
                              <CheckCheck className="h-3 w-3 text-blue-300" />
                            ) : (
                              <Check className="h-3 w-3 text-primary-foreground/70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 sm:p-4 border-t border-border bg-card safe-area-inset-bottom">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-11 text-base"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!messageInput.trim()}
                className="h-11 w-11 flex-shrink-0 active:scale-95 transition-transform"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <MessageCircle className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to ChutkiiChat</h2>
          <p className="text-muted-foreground max-w-md">
            Select a conversation from the sidebar or start a new chat to begin messaging.
          </p>
        </div>
      )}
    </div>
  );

  if (!user) return null;

  return (
    <div className="h-[100dvh] flex bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 lg:w-96 border-r border-border flex-col bg-card flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[85vw] max-w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${showMobileChat ? '' : 'hidden md:flex'}`}>
        <ChatArea />
      </div>

      {/* Mobile: Show conversations list when no chat selected */}
      <div className={`flex-1 flex-col md:hidden min-w-0 ${!showMobileChat ? 'flex' : 'hidden'}`}>
        <SidebarContent />
      </div>
    </div>
  );
};

export default ChatApp;
