import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, MessageCircle, Clock, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface SessionData {
  id: string;
  code: string;
  created_at: string;
  last_activity_at: string;
  onlineCount: number;
  messageCount: number;
}

const Admin = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const navigate = useNavigate();

  const fetchSessionData = useCallback(async () => {
    console.log('Fetching session data...');
    
    // Fetch all sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .order('last_activity_at', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return;
    }

    console.log('Sessions fetched:', sessionsData?.length);

    // Get message counts for each session
    const sessionsWithData: SessionData[] = await Promise.all(
      (sessionsData || []).map(async (session) => {
        // Get message count
        const { count: messageCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_code', session.code);

        // Get online users via presence
        const onlineCount = await getOnlineCount(session.code);

        return {
          id: session.id,
          code: session.code,
          created_at: session.created_at,
          last_activity_at: session.last_activity_at,
          onlineCount,
          messageCount: messageCount || 0
        };
      })
    );

    setSessions(sessionsWithData);
    setTotalUsers(sessionsWithData.reduce((sum, s) => sum + s.onlineCount, 0));
    setLoading(false);
  }, []);

  const getOnlineCount = async (sessionCode: string): Promise<number> => {
    return new Promise((resolve) => {
      const channel = supabase.channel(`admin-presence-${sessionCode}-${Date.now()}`);
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          supabase.removeChannel(channel);
          resolve(0);
        }
      }, 2000);

      channel
        .on('presence', { event: 'sync' }, () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            const state = channel.presenceState();
            let count = 0;
            Object.values(state).forEach((presences: any) => {
              count += presences.length;
            });
            supabase.removeChannel(channel);
            resolve(count);
          }
        })
        .subscribe();
    });
  };

  useEffect(() => {
    fetchSessionData();

    // Subscribe to realtime session changes
    const channel = supabase
      .channel('admin-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        (payload) => {
          console.log('Session change detected:', payload);
          fetchSessionData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('New message detected');
          fetchSessionData();
        }
      )
      .subscribe();

    // Refresh online counts every 10 seconds
    const interval = setInterval(() => {
      fetchSessionData();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchSessionData]);

  const handleViewRoom = (code: string) => {
    // Open room in new tab
    window.open(`/room/${code}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient-chutki">
              ChutkiiChat Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor active sessions in real-time
            </p>
          </div>
          <Button onClick={fetchSessionData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Online Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {sessions.reduce((sum, s) => sum + s.messageCount, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Active Sessions
              <Badge variant="secondary" className="ml-2">
                Live
                <span className="w-2 h-2 bg-green-500 rounded-full ml-1 animate-pulse" />
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No active sessions</p>
                <p className="text-sm">Sessions will appear here when users create rooms</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Room Code</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Users Online</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Messages</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Activity</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-primary tracking-wider">
                            {session.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className={session.onlineCount > 0 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                              {session.onlineCount}
                            </span>
                            {session.onlineCount > 0 && (
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{session.messageCount}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewRoom(session.code)}
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Auto-refreshes every 10 seconds • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Admin;
