import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_online: boolean | null;
  status: string | null;
}

export const useAllUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_online, status')
        .neq('id', user.id)
        .eq('is_blocked', false)
        .order('display_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, refreshUsers: fetchUsers };
};
