import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageRead {
  userName: string;
  readAt: Date;
}

export const useMessageReads = (sessionCode: string, userName: string) => {
  const [reads, setReads] = useState<Record<string, MessageRead[]>>({});
  const markedAsReadRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionCode) return;

    // Load existing reads
    const loadReads = async () => {
      const { data, error } = await supabase
        .from('message_reads')
        .select('*')
        .eq('session_code', sessionCode);

      if (error) {
        console.error('Error loading reads:', error);
        return;
      }

      const readsMap: Record<string, MessageRead[]> = {};
      data?.forEach(read => {
        if (!readsMap[read.message_id]) {
          readsMap[read.message_id] = [];
        }
        readsMap[read.message_id].push({
          userName: read.user_name,
          readAt: new Date(read.read_at)
        });
        // Track already marked reads
        if (read.user_name === userName) {
          markedAsReadRef.current.add(read.message_id);
        }
      });
      setReads(readsMap);
    };

    loadReads();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`reads-${sessionCode}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reads',
          filter: `session_code=eq.${sessionCode}`
        },
        (payload) => {
          const newRead = payload.new as {
            message_id: string;
            user_name: string;
            read_at: string;
          };

          setReads(prev => {
            const existing = prev[newRead.message_id] || [];
            if (existing.some(r => r.userName === newRead.user_name)) {
              return prev;
            }
            return {
              ...prev,
              [newRead.message_id]: [
                ...existing,
                { userName: newRead.user_name, readAt: new Date(newRead.read_at) }
              ]
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode, userName]);

  const markAsRead = useCallback(async (messageId: string, messageSender: string) => {
    // Don't mark own messages as read
    if (messageSender === userName) return;
    
    // Check if already marked
    if (markedAsReadRef.current.has(messageId)) return;
    
    markedAsReadRef.current.add(messageId);

    const { error } = await supabase
      .from('message_reads')
      .upsert({
        message_id: messageId,
        user_name: userName,
        session_code: sessionCode
      }, {
        onConflict: 'message_id,user_name'
      });

    if (error) {
      console.error('Error marking as read:', error);
      markedAsReadRef.current.delete(messageId);
    }
  }, [sessionCode, userName]);

  const getReadersForMessage = useCallback((messageId: string, messageSender: string): string[] => {
    const messageReads = reads[messageId] || [];
    // Filter out the sender themselves
    return messageReads
      .filter(r => r.userName !== messageSender)
      .map(r => r.userName);
  }, [reads]);

  return { reads, markAsRead, getReadersForMessage };
};
