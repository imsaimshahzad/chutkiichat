import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Contact {
  id: string;
  contact_id: string;
  nickname: string | null;
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    status: string | null;
    is_online: boolean;
    last_seen: string;
  };
}

export const useContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, contact_id, nickname')
        .eq('user_id', user.id);

      if (error) throw error;

      // Fetch profiles for each contact
      const contactIds = data?.map(c => c.contact_id) || [];
      
      if (contactIds.length === 0) {
        setContacts([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, status, is_online, last_seen')
        .in('id', contactIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      const contactsWithProfiles = (data || []).map(contact => ({
        ...contact,
        profile: profileMap.get(contact.contact_id)!,
      })).filter(c => c.profile);

      setContacts(contactsWithProfiles);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contactId: string, nickname?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: contactId,
          nickname: nickname || null,
        });

      if (error) throw error;

      fetchContacts();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const removeContact = async (contactId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('user_id', user.id)
        .eq('contact_id', contactId);

      if (error) throw error;

      fetchContacts();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const searchUsers = async (query: string) => {
    if (!user || !query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_online')
        .neq('id', user.id)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  return {
    contacts,
    loading,
    addContact,
    removeContact,
    searchUsers,
    refreshContacts: fetchContacts,
  };
};
