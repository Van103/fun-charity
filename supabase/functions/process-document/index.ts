import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text extraction - for TXT and MD files
function extractTextFromPlainFile(content: string): string {
  return content.trim();
}

// Split text into chunks
function splitIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // If no paragraphs found, split by sentences
  if (chunks.length === 0 && text.length > 0) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
  }

  return chunks.length > 0 ? chunks : [text];
}

// Generate title from content
function generateTitle(content: string, index: number): string {
  const firstLine = content.split('\n')[0].trim();
  const title = firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
  return title || `Chunk ${index + 1}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const keywords = formData.get('keywords') as string || '';
    const priority = parseInt(formData.get('priority') as string) || 0;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    
    // Read file content
    const fileBuffer = await file.arrayBuffer();
    let textContent = '';

    // Extract text based on file type
    if (fileExt === 'txt' || fileExt === 'md') {
      const decoder = new TextDecoder('utf-8');
      textContent = extractTextFromPlainFile(decoder.decode(fileBuffer));
    } else if (fileExt === 'pdf') {
      // For PDF, we'll store the file and let admin manually add content
      // PDF parsing in Deno edge functions is complex
      return new Response(JSON.stringify({ 
        error: 'PDF files need manual text entry. Please copy the text content and use the manual entry form.',
        requiresManualEntry: true 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (fileExt === 'docx' || fileExt === 'doc') {
      // DOCX parsing is complex, suggest manual entry
      return new Response(JSON.stringify({ 
        error: 'Word documents need manual text entry. Please copy the text content and use the manual entry form.',
        requiresManualEntry: true 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported file type. Supported: .txt, .md' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!textContent.trim()) {
      return new Response(JSON.stringify({ error: 'File is empty or could not extract text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upload file to storage
    const filePath = `${user.id}/${Date.now()}_${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('angel-documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to upload file' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get file URL
    const { data: urlData } = supabase.storage
      .from('angel-documents')
      .getPublicUrl(filePath);

    // Split content into chunks
    const chunks = splitIntoChunks(textContent);
    const keywordsArray = keywords.split(',').map(k => k.trim()).filter(Boolean);

    // Create knowledge entries for each chunk
    const entries = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const title = generateTitle(chunk, i);
      
      const { data: entry, error: insertError } = await supabase
        .from('angel_knowledge')
        .insert({
          title: `${fileName} - ${title}`,
          content: chunk,
          category,
          keywords: keywordsArray,
          priority,
          source_file_url: urlData.publicUrl,
          source_file_name: fileName,
          uploaded_by: user.id,
          chunk_index: i,
          total_chunks: chunks.length,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
      } else {
        entries.push(entry);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${fileName}`,
      chunks_created: entries.length,
      total_chunks: chunks.length,
      entries,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
