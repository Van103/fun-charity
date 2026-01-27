import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { RtcTokenBuilder, RtcRole } from "https://esm.sh/agora-token@2.0.3";

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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[agora-token] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[agora-token] Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[agora-token] Authenticated user: ${user.id}`);

    const AGORA_APP_ID = Deno.env.get('AGORA_APP_ID');
    const AGORA_APP_CERTIFICATE = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      console.error('[agora-token] Missing credentials - AGORA_APP_ID or AGORA_APP_CERTIFICATE not set');
      throw new Error('Agora credentials not configured');
    }

    const { channelName, uid, role = 1 } = await req.json();

    if (!channelName) {
      throw new Error('Channel name is required');
    }

    console.log(`[agora-token] Building token with RtcTokenBuilder`);
    console.log(`[agora-token] AppID: ${AGORA_APP_ID.substring(0, 8)}...`);
    console.log(`[agora-token] Channel: ${channelName}, UID: ${uid}, Role: ${role}`);

    // Token expires in 24 hours (86400 seconds)
    const tokenExpireSeconds = 86400;
    const privilegeExpireSeconds = 86400;

    // Use official RtcTokenBuilder from agora-token library
    const agoraRole = role === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid || 0,
      agoraRole,
      tokenExpireSeconds,
      privilegeExpireSeconds
    );

    console.log('[agora-token] Token generated successfully with official library, length:', token.length);

    return new Response(
      JSON.stringify({
        token,
        appId: AGORA_APP_ID,
        channel: channelName,
        uid: uid || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('[agora-token] Error generating Agora token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
