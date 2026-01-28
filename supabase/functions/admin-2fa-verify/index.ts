import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  action: 'send';
}

interface VerifyOTPRequest {
  action: 'verify';
  otp: string;
  sessionId: string;
}

type RequestBody = SendOTPRequest | VerifyOTPRequest;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'moderator'])
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'User is not an admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();

    if (body.action === 'send') {
      // Rate limiting: Check recent OTP attempts
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentAttempts, error: attemptsError } = await supabase
        .from('admin_sessions')
        .select('id')
        .eq('admin_id', user.id)
        .gte('created_at', fiveMinutesAgo);

      if (attemptsError) {
        console.error('Error checking rate limit:', attemptsError);
      }

      if (recentAttempts && recentAttempts.length >= 5) {
        return new Response(
          JSON.stringify({ error: 'Too many attempts. Please wait 5 minutes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      const sessionExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store OTP
      const { data: session, error: insertError } = await supabase
        .from('admin_sessions')
        .insert({
          admin_id: user.id,
          otp_code: otp,
          otp_expires_at: otpExpiresAt.toISOString(),
          session_expires_at: sessionExpiresAt.toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating session:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // In production, send email here
      // For now, log OTP for development
      console.log(`Admin OTP for ${user.email}: ${otp}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionId: session.id,
          message: 'OTP sent successfully',
          // Only include OTP in development
          ...(Deno.env.get('ENVIRONMENT') !== 'production' && { otp })
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (body.action === 'verify') {
      const { otp, sessionId } = body;

      if (!otp || !sessionId) {
        return new Response(
          JSON.stringify({ error: 'Missing OTP or session ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify OTP
      const { data: session, error: verifyError } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('admin_id', user.id)
        .eq('otp_code', otp)
        .gt('otp_expires_at', new Date().toISOString())
        .is('verified_at', null)
        .single();

      if (verifyError || !session) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired OTP' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('admin_sessions')
        .update({ 
          verified_at: new Date().toISOString(),
          otp_code: null // Clear OTP after use
        })
        .eq('id', session.id);

      if (updateError) {
        console.error('Error updating session:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP verified successfully',
          expiresAt: session.session_expires_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-2fa-verify:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
