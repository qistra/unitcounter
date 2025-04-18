
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
    // Parse the incoming request
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      throw new Error('No image file provided');
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Call DeepSeek OCR API
    const response = await fetch('https://api.deepseek.com/v1/vision/detect_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`
      },
      body: JSON.stringify({
        image: base64Data,
        options: {
          language: "auto"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract numeric value from detected text
    const detectedText = data.text || '';
    const numericValue = extractNumberFromText(detectedText);

    return new Response(
      JSON.stringify({ 
        text: detectedText, 
        numericValue: numericValue || '' 
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('OCR processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Helper function to extract numeric values from text
function extractNumberFromText(text: string): string | null {
  // First try to find sequences of digits that look like meter readings
  const meterReadingPattern = /\b\d+(\.\d+)?\b/g;
  const matches = text.match(meterReadingPattern);
  
  if (matches && matches.length > 0) {
    // Return the first match as our best guess for the meter reading
    return matches[0];
  }
  
  // If no obvious meter reading pattern is found, try a more aggressive approach
  const anyDigitPattern = /\d+/g;
  const digitsOnly = text.match(anyDigitPattern);
  
  if (digitsOnly && digitsOnly.length > 0) {
    return digitsOnly[0];
  }
  
  return null;
}
