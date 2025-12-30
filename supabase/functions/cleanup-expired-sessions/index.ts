import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key - require the anon key to prevent unauthorized access
    const apikey = req.headers.get('apikey');
    const expectedKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!apikey || apikey !== expectedKey) {
      console.error('Unauthorized access attempt - invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Starting expired sessions cleanup...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, get expired session codes to clean up their storage files
    const { data: expiredSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('code')
      .lt('last_activity_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (sessionsError) {
      console.error('Error fetching expired sessions:', sessionsError);
    }
    
    // Clean up storage files for expired sessions
    let filesDeleted = 0;
    if (expiredSessions && expiredSessions.length > 0) {
      for (const session of expiredSessions) {
        try {
          // List all files in the session folder
          const { data: files, error: listError } = await supabase.storage
            .from('chat-attachments')
            .list(session.code);
          
          if (listError) {
            console.error(`Error listing files for session ${session.code}:`, listError);
            continue;
          }
          
          if (files && files.length > 0) {
            const filePaths = files.map(f => `${session.code}/${f.name}`);
            const { error: deleteError } = await supabase.storage
              .from('chat-attachments')
              .remove(filePaths);
            
            if (deleteError) {
              console.error(`Error deleting files for session ${session.code}:`, deleteError);
            } else {
              filesDeleted += files.length;
              console.log(`Deleted ${files.length} files from session ${session.code}`);
            }
          }
        } catch (fileError) {
          console.error(`Error cleaning up files for session ${session.code}:`, fileError);
        }
      }
    }
    
    // Call the cleanup function for database records
    const { data, error } = await supabase.rpc('cleanup_expired_sessions');
    
    if (error) {
      console.error('Error cleaning up sessions:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Cleanup complete. Deleted ${data} expired sessions and ${filesDeleted} files.`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount: data,
        filesDeleted: filesDeleted,
        message: `Cleaned up ${data} expired sessions and ${filesDeleted} files` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
