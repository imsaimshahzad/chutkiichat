import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, Conversation } from '@/hooks/useConversations';
import { useChatMessages, ChatMessage } from '@/hooks/useChatMessages';
import { useContacts } from '@/hooks/useContacts';
import { useAllUsers } from '@/hooks/useAllUsers';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAppViewportHeight } from '@/hooks/useAppViewportHeight';
import ProfileSettings from '@/components/ProfileSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  Trash2,
  Ban,
  UserX,
  Eraser,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ChatApp = () => {
  useAppViewportHeight();

  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin } = useAuth();
  const { conversations, loading: convsLoading, createConversation, deleteConversation, refreshConversations } = useConversations();
  const { contacts, searchUsers, addContact } = useContacts();
  const { users: allUsers, loading: usersLoading } = useAllUsers();
  const { blockUser, unblockUser, isBlocked } = useBlockedUsers();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { messages, loading: msgsLoading, sendMessage, deleteMessage, clearChat } = useChatMessages(selectedConversation?.id || null);
  
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync selected conversation with updated conversations list
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      const updatedConv = conversations.find(c => c.id === selectedConversation.id);
      if (updatedConv && JSON.stringify(updatedConv) !== JSON.stringify(selectedConversation)) {
        setSelectedConversation(updatedConv);
      }
    }
  }, [conversations, selectedConversation]);

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
    if (isCreatingChat) return;
    
    setIsCreatingChat(true);
    try {
      const conversationId = await createConversation(userId);
      if (conversationId) {
        // Close dialog and show chat immediately
        setIsNewChatOpen(false);
        setShowMobileChat(true);
        
        // Set a temporary conversation object while waiting for full refresh
        const otherUser = allUsers.find(u => u.id === userId);
        if (otherUser) {
          setSelectedConversation({
            id: conversationId,
            is_group: false,
            group_name: null,
            group_avatar: null,
            participants: [{
              id: otherUser.id,
              username: otherUser.username,
              display_name: otherUser.display_name,
              avatar_url: otherUser.avatar_url,
              is_online: otherUser.is_online || false,
              last_seen: new Date().toISOString(),
            }],
            last_message: null,
            unread_count: 0,
            updated_at: new Date().toISOString(),
          });
        }
        toast.success('Chat started!');
      } else {
        toast.error('Failed to start conversation');
      }
    } finally {
      setIsCreatingChat(false);
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

  const handleDeleteMessage = async () => {
    if (!selectedMessageId) return;
    const success = await deleteMessage(selectedMessageId);
    if (success) {
      toast.success('Message deleted');
    } else {
      toast.error('Failed to delete message');
    }
    setSelectedMessageId(null);
  };

  const handleClearChat = async () => {
    const success = await clearChat();
    if (success) {
      toast.success('Chat cleared');
    } else {
      toast.error('Failed to clear chat');
    }
    setClearConfirmOpen(false);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    const success = await deleteConversation(selectedConversation.id);
    if (success) {
      setSelectedConversation(null);
      setShowMobileChat(false);
      toast.success('Chat deleted');
    } else {
      toast.error('Failed to delete chat');
    }
    setDeleteConfirmOpen(false);
  };

  const handleBlockUser = async () => {
    if (!selectedConversation || selectedConversation.is_group) return;
    const participantId = selectedConversation.participants[0]?.id;
    if (!participantId) return;

    const currentlyBlocked = isBlocked(participantId);
    
    if (currentlyBlocked) {
      const success = await unblockUser(participantId);
      if (success) {
        toast.success('User unblocked');
      } else {
        toast.error('Failed to unblock user');
      }
    } else {
      const success = await blockUser(participantId);
      if (success) {
        toast.success('User blocked');
      } else {
        toast.error('Failed to block user');
      }
    }
    setBlockConfirmOpen(false);
  };

  const getParticipantId = () => {
    if (!selectedConversation || selectedConversation.is_group) return null;
    return selectedConversation.participants[0]?.id || null;
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
    <div className="flex flex-col h-full overflow-hidden bg-card">
      {/* WhatsApp-style Header */}
      <div className="wa-header px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-white/20">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-white/20 text-white">
              {profile?.display_name?.[0] || profile?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 hidden sm:block">
            <p className="font-medium text-white truncate text-sm">{profile?.display_name || profile?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/admin')} 
              title="Admin Panel"
              className="h-10 w-10 text-white hover:bg-white/10"
            >
              <Shield className="h-5 w-5" />
            </Button>
          )}
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10">
                <MessageCircle className="h-5 w-5" />
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
                  {isSearching || usersLoading || isCreatingChat ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      {isCreatingChat && <p className="text-sm text-muted-foreground mt-2">Starting chat...</p>}
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    // Show search results
                    searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleStartChat(user.id)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={user.avatar_url || ''} />
                                <AvatarFallback className="bg-primary/20 text-primary">{user.display_name?.[0] || user.username[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.display_name || user.username}</p>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddContact(user.id);
                              }}
                              className="text-primary"
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
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground px-3 py-2 uppercase tracking-wide">All Users</p>
                      {allUsers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No users available</p>
                      ) : (
                        allUsers.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleStartChat(u.id)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="relative">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={u.avatar_url || ''} />
                                  <AvatarFallback className="bg-primary/20 text-primary">{u.display_name?.[0] || u.username[0]}</AvatarFallback>
                                </Avatar>
                                {u.is_online && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[hsl(var(--wa-online))] rounded-full border-2 border-card" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{u.display_name || u.username}</p>
                                <p className="text-sm text-muted-foreground">@{u.username}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddContact(u.id);
                              }}
                              className="text-primary"
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ProfileSettings open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {/* Search Bar */}
      <div className="px-2 py-2 bg-card border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search or start new chat"
            className="pl-10 h-9 bg-muted border-0 rounded-lg text-sm"
            readOnly
            onClick={() => setIsNewChatOpen(true)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 bg-card">
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
            <p className="text-sm text-muted-foreground mb-4">Start a new conversation!</p>
            <Button onClick={() => setIsNewChatOpen(true)} className="bg-primary hover:bg-primary/90">
              <MessageCircle className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        ) : (
          <div>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`wa-conversation-item flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/30 ${
                  selectedConversation?.id === conv.id ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedConversation(conv);
                  setShowMobileChat(true);
                }}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getConversationAvatar(conv) || ''} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {conv.is_group ? <Users className="h-5 w-5" /> : getConversationName(conv)[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isParticipantOnline(conv) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[hsl(var(--wa-online))] rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium text-foreground truncate text-[15px]">{getConversationName(conv)}</p>
                    <span className={`text-xs ml-2 flex-shrink-0 ${conv.unread_count > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {conv.last_message && formatConversationTime(conv.last_message.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message?.content || 'No messages yet'}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unread_count > 99 ? '99+' : conv.unread_count}
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
    <div className="flex flex-col h-full overflow-hidden">
      {selectedConversation ? (
        <>
          {/* WhatsApp-style Chat Header */}
          <div className="wa-header px-2 sm:px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 text-white hover:bg-white/10"
                onClick={() => setShowMobileChat(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getConversationAvatar(selectedConversation) || ''} />
                  <AvatarFallback className="bg-white/20 text-white">{getConversationName(selectedConversation)[0]}</AvatarFallback>
                </Avatar>
                {isParticipantOnline(selectedConversation) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[hsl(var(--wa-online))] rounded-full border-2 border-[hsl(var(--wa-header))]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-white truncate text-[15px]">{getConversationName(selectedConversation)}</p>
                <p className="text-xs text-white/70">
                  {isParticipantOnline(selectedConversation) ? 'online' : 'offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10 hidden sm:flex">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10 hidden sm:flex">
                <Phone className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setClearConfirmOpen(true)}>
                    <Eraser className="h-4 w-4 mr-2" />
                    Clear Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteConfirmOpen(true)} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Chat
                  </DropdownMenuItem>
                  {!selectedConversation.is_group && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setBlockConfirmOpen(true)}>
                        {isBlocked(getParticipantId() || '') ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Unblock User
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-2" />
                            Block User
                          </>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages with WhatsApp background */}
          <ScrollArea className="flex-1 wa-chat-bg">
            <div className="p-3 sm:p-4">
              {msgsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="bg-card/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
                    <p className="text-muted-foreground text-sm">No messages yet. Say hi! 👋</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <DropdownMenu key={msg.id}>
                        <DropdownMenuTrigger asChild>
                          <div
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} cursor-pointer mb-1`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] px-3 py-1.5 ${
                                isOwn ? 'wa-bubble-sent mr-2' : 'wa-bubble-received ml-2'
                              }`}
                            >
                              <p className="break-words text-[14.5px] leading-relaxed">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
                                <span className="text-[11px] text-muted-foreground">
                                  {formatMessageTime(msg.created_at)}
                                </span>
                                {isOwn && (
                                  msg.is_read ? (
                                    <CheckCheck className="h-4 w-4 text-[hsl(var(--wa-read))]" />
                                  ) : (
                                    <CheckCheck className="h-4 w-4 text-muted-foreground" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </DropdownMenuTrigger>
                        {isOwn && (
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedMessageId(msg.id);
                                handleDeleteMessage();
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        )}
                      </DropdownMenu>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* WhatsApp-style Message Input */}
          <div className="wa-input-area px-2 py-2 safe-area-inset-bottom flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 bg-card rounded-full flex items-center px-4 shadow-sm">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 h-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px]"
                  autoComplete="off"
                  autoCorrect="off"
                  enterKeyHint="send"
                />
              </div>
              <Button 
                type="submit" 
                size="icon" 
                disabled={!messageInput.trim()}
                className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 flex-shrink-0 shadow-sm"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center wa-chat-bg">
          <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-md">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">ChutkiiChat</h2>
            <p className="text-muted-foreground text-sm">
              Select a chat or start a new conversation
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (!user) return null;

  return (
    <>
      <div className="app-viewport flex bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-[30%] min-w-[300px] max-w-[400px] flex-col bg-card wa-sidebar flex-shrink-0">
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

      {/* Clear Chat Confirmation */}
      <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all messages in this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearChat} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Chat Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entire conversation? All messages will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConversation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block User Confirmation */}
      <AlertDialog open={blockConfirmOpen} onOpenChange={setBlockConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBlocked(getParticipantId() || '') ? 'Unblock User' : 'Block User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBlocked(getParticipantId() || '') 
                ? 'Are you sure you want to unblock this user? They will be able to send you messages again.'
                : 'Are you sure you want to block this user? You will no longer receive messages from them.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockUser}>
              {isBlocked(getParticipantId() || '') ? 'Unblock' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatApp;
