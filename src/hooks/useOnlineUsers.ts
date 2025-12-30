import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OnlineUser {
  name: string;
  online_at: string;
}

export const useOnlineUsers = (sessionCode: string, userName: string) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!sessionCode || !userName) return;

    const channel = supabase.channel(`presence-${sessionCode}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: OnlineUser) => {
            if (!users.find(u => u.name === presence.name)) {
              users.push(presence);
            }
          });
        });
        
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: userName,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [sessionCode, userName]);

  // Update presence when username changes
  useEffect(() => {
    const channel = supabase.channel(`presence-${sessionCode}`);
    
    const updatePresence = async () => {
      await channel.track({
        name: userName,
        online_at: new Date().toISOString(),
      });
    };
    
    if (userName) {
      updatePresence();
    }
  }, [userName, sessionCode]);

  return { onlineUsers, onlineCount: onlineUsers.length };
};
