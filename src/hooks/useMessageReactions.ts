import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface MessageReactions {
  [messageId: string]: Reaction[];
}

export const useMessageReactions = (sessionCode: string, userName: string) => {
  const [reactions, setReactions] = useState<MessageReactions>({});

  // Fetch initial reactions for all messages in session
  const fetchReactions = useCallback(async () => {
    const { data: messages } = await supabase
      .from("messages")
      .select("id")
      .eq("session_code", sessionCode);

    if (!messages?.length) return;

    const messageIds = messages.map(m => m.id);
    
    const { data: reactionData } = await supabase
      .from("message_reactions")
      .select("*")
      .in("message_id", messageIds);

    if (reactionData) {
      const grouped: MessageReactions = {};
      
      reactionData.forEach((r) => {
        if (!grouped[r.message_id]) {
          grouped[r.message_id] = [];
        }
        
        const existing = grouped[r.message_id].find(x => x.emoji === r.emoji);
        if (existing) {
          existing.users.push(r.user_name);
          existing.count++;
        } else {
          grouped[r.message_id].push({
            emoji: r.emoji,
            users: [r.user_name],
            count: 1
          });
        }
      });
      
      setReactions(grouped);
    }
  }, [sessionCode]);

  useEffect(() => {
    fetchReactions();

    // Subscribe to realtime reaction changes
    const channel = supabase
      .channel(`reactions-${sessionCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions"
        },
        () => {
          // Refetch all reactions on any change
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode, fetchReactions]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    const { error } = await supabase
      .from("message_reactions")
      .insert({
        message_id: messageId,
        emoji,
        user_name: userName
      });

    if (error && error.code !== "23505") { // Ignore duplicate key errors
      console.error("Error adding reaction:", error);
    }
  }, [userName]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    const { error } = await supabase
      .from("message_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("emoji", emoji)
      .eq("user_name", userName);

    if (error) {
      console.error("Error removing reaction:", error);
    }
  }, [userName]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    const messageReactions = reactions[messageId] || [];
    const existingReaction = messageReactions.find(r => r.emoji === emoji);
    
    if (existingReaction?.users.includes(userName)) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  }, [reactions, userName, addReaction, removeReaction]);

  return {
    reactions,
    toggleReaction,
    addReaction
  };
};
