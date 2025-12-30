import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  status: string | null;
  is_online: boolean;
  is_blocked: boolean;
  last_seen: string;
  created_at: string;
  role: 'admin' | 'user';
}

export const useAdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = useCallback(async () => {
    if (!user) return false;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    return !!data;
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    try {
      // Check if current user is admin
      const adminCheck = await checkAdminStatus();
      setIsAdmin(adminCheck);
      
      if (!adminCheck) {
        setLoading(false);
        return;
      }

      // Fetch all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch roles for all users
      const userIds = profiles?.map(p => p.id) || [];
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]));

      const usersWithRoles: AdminUser[] = (profiles || []).map(profile => ({
        ...profile,
        is_blocked: profile.is_blocked || false,
        role: (roleMap.get(profile.id) as 'admin' | 'user') || 'user',
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [user, checkAdminStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const blockUser = async (userId: string, blocked: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: blocked })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_blocked: blocked } : u
      ));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      // First delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role } : u
      ));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateUser = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: updates.display_name,
          username: updates.username,
          status: updates.status,
        })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, ...updates } : u
      ));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete profile (cascade will handle related data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    users,
    loading,
    isAdmin,
    blockUser,
    updateUserRole,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers,
  };
};
