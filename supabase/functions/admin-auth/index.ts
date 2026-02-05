import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { email, password } = await req.json();
    
    console.log('Admin login attempt for:', email);

    // Get admin credentials from environment
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Admin not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate credentials
    if (email === adminEmail && password === adminPassword) {
      // Generate a simple session token
      const token = crypto.randomUUID();
      const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      console.log('Admin login successful');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          token,
          expiry
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin login failed - invalid credentials');
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid credentials' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin auth error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Authentication failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
