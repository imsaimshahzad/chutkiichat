import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingUser {
  userName: string;
  timestamp: number;
}

export const useTypingIndicator = (sessionCode: string, currentUserName: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    console.log('Setting up typing indicator for session:', sessionCode);
    
    const channel = supabase.channel(`typing-${sessionCode}`, {
      config: {
        broadcast: { self: false }
      }
    });
    
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        console.log('Typing broadcast received:', payload);
        const { userName, isTyping } = payload.payload as { userName: string; isTyping: boolean };
        
        if (userName === currentUserName) return;
        
        setTypingUsers(prev => {
          if (isTyping) {
            // Add or update typing user
            const existing = prev.find(u => u.userName === userName);
            if (existing) {
              return prev.map(u => 
                u.userName === userName ? { ...u, timestamp: Date.now() } : u
              );
            }
            return [...prev, { userName, timestamp: Date.now() }];
          } else {
            // Remove user from typing list
            return prev.filter(u => u.userName !== userName);
          }
        });
      })
      .subscribe((status) => {
        console.log('Typing channel subscription status:', status);
      });

    channelRef.current = channel;

    // Clean up stale typing indicators every 3 seconds
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => prev.filter(u => now - u.timestamp < 3000));
    }, 1000);

    return () => {
      console.log('Cleaning up typing indicator channel');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      clearInterval(cleanupInterval);
      supabase.removeChannel(channel);
    };
  }, [sessionCode, currentUserName]);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!channelRef.current) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userName: currentUserName, isTyping }
    });
  }, [currentUserName]);

  const handleTyping = useCallback(() => {
    // Send typing start if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingStatus(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingStatus(false);
    }, 2000);
  }, [sendTypingStatus]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTypingStatus(false);
    }
  }, [sendTypingStatus]);

  // Get display text for typing users
  const typingText = typingUsers.length === 0 
    ? null 
    : typingUsers.length === 1 
      ? `${typingUsers[0].userName} is typing...`
      : typingUsers.length === 2
        ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
        : `${typingUsers.length} people are typing...`;

  return {
    typingUsers,
    typingText,
    handleTyping,
    stopTyping
  };
};
