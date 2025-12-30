import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useStarredMessages = () => {
  const { user } = useAuth();
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchStarredMessages = useCallback(async () => {
    if (!user) {
      setStarredIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('starred_messages')
        .select('message_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setStarredIds(new Set(data?.map(s => s.message_id) || []));
    } catch (error) {
      console.error('Error fetching starred messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStarredMessages();
  }, [fetchStarredMessages]);

  const toggleStar = async (messageId: string) => {
    if (!user) return false;

    const isCurrentlyStarred = starredIds.has(messageId);

    try {
      if (isCurrentlyStarred) {
        // Unstar
        const { error } = await supabase
          .from('starred_messages')
          .delete()
          .eq('user_id', user.id)
          .eq('message_id', messageId);

        if (error) throw error;

        setStarredIds(prev => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      } else {
        // Star
        const { error } = await supabase
          .from('starred_messages')
          .insert({
            user_id: user.id,
            message_id: messageId,
          });

        if (error) throw error;

        setStarredIds(prev => new Set([...prev, messageId]));
      }
      return true;
    } catch (error) {
      console.error('Error toggling star:', error);
      return false;
    }
  };

  const isStarred = (messageId: string) => starredIds.has(messageId);

  return {
    starredIds,
    loading,
    toggleStar,
    isStarred,
    refreshStarred: fetchStarredMessages,
  };
};
