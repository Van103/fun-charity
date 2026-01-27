import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignedUrlRequest {
  documentPath: string;
  kycRequestId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin', { _user_id: user.id });
    
    if (adminError || !isAdmin) {
      console.log("KYC Document Access: Non-admin user attempted access", user.id);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { documentPath, kycRequestId }: SignedUrlRequest = await req.json();

    if (!documentPath) {
      return new Response(
        JSON.stringify({ error: "Document path is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the path from the full URL if needed
    let storagePath = documentPath;
    if (documentPath.includes('/storage/v1/object/')) {
      // Extract path from public URL format
      const match = documentPath.match(/\/storage\/v1\/object\/(?:public|sign)\/kyc-documents\/(.+)/);
      if (match) {
        storagePath = match[1];
      }
    } else if (documentPath.includes('kyc-documents/')) {
      // Extract path if bucket name is included
      storagePath = documentPath.replace(/^.*kyc-documents\//, '');
    }

    console.log("KYC Document Access: Generating signed URL for", storagePath);

    // Generate short-lived signed URL (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('kyc-documents')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.error("Error generating signed URL:", signedUrlError);
      return new Response(
        JSON.stringify({ error: "Failed to generate document URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log admin document access for audit
    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      action_type: "kyc_document_access",
      target_type: "kyc_document",
      target_id: kycRequestId || null,
      details: {
        document_path: storagePath,
        accessed_at: new Date().toISOString(),
        expiry_seconds: 3600,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      }
    });

    console.log("KYC Document Access: Signed URL generated and access logged for admin", user.id);

    return new Response(
      JSON.stringify({ 
        signedUrl: signedUrlData.signedUrl,
        expiresIn: 3600
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("KYC Document Access error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
