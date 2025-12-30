import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Participant {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
}

interface LastMessage {
  content: string;
  created_at: string;
  sender_id: string;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  group_name: string | null;
  group_avatar: string | null;
  participants: Participant[];
  last_message: LastMessage | null;
  unread_count: number;
  updated_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Get all conversations the user is part of
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (partError) throw partError;

      if (!participations || participations.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participations.map(p => p.conversation_id);

      // Fetch conversation details
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds);

      if (convError) throw convError;

      // For each conversation, get participants and last message
      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          // Get participants
          const { data: parts } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id);

          const participantIds = parts?.map(p => p.user_id).filter(id => id !== user.id) || [];

          // Get participant profiles
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, is_online, last_seen')
            .in('id', participantIds);

          // Get last message
          const { data: messages } = await supabase
            .from('chat_messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Get unread count
          const { data: myParticipation } = await supabase
            .from('conversation_participants')
            .select('last_read_at')
            .eq('conversation_id', conv.id)
            .eq('user_id', user.id)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .gt('created_at', myParticipation?.last_read_at || '1970-01-01');

          return {
            id: conv.id,
            is_group: conv.is_group,
            group_name: conv.group_name,
            group_avatar: conv.group_avatar,
            participants: profiles || [],
            last_message: messages?.[0] || null,
            unread_count: unreadCount || 0,
            updated_at: conv.updated_at,
          };
        })
      );

      // Sort by last message time
      conversationsWithDetails.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.updated_at;
        const bTime = b.last_message?.created_at || b.updated_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  const createConversation = async (participantId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Check if conversation already exists between these two users
      const { data: existingParts } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      for (const part of existingParts || []) {
        const { data: otherPart } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', part.conversation_id)
          .eq('user_id', participantId)
          .maybeSingle();

        if (otherPart) {
          // Check if it's a direct (non-group) conversation
          const { data: conv } = await supabase
            .from('conversations')
            .select('is_group')
            .eq('id', part.conversation_id)
            .maybeSingle();

          if (conv && !conv.is_group) {
            // Existing conversation found - refresh and return
            await fetchConversations();
            return part.conversation_id;
          }
        }
      }

      // Create new conversation - use raw insert without .select() to avoid RLS timing issues
      const newConvId = crypto.randomUUID();
      
      const { error: convError } = await supabase
        .from('conversations')
        .insert({
          id: newConvId,
          is_group: false,
          created_by: user.id,
        });

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      // Add participants immediately
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConvId, user_id: user.id },
          { conversation_id: newConvId, user_id: participantId },
        ]);

      if (partError) {
        console.error('Error adding participants:', partError);
        throw partError;
      }

      // Refresh conversations list
      await fetchConversations();
      return newConvId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  return {
    conversations,
    loading,
    createConversation,
    refreshConversations: fetchConversations,
  };
};
