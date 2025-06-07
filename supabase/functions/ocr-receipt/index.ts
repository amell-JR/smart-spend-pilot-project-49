
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const groqApiKey = Deno.env.get('GROQ_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, userId } = await req.json();

    if (!imageBase64 || !userId) {
      return new Response(
        JSON.stringify({ error: 'Image data and user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing receipt OCR for user:', userId);

    // Use Groq's vision model for OCR
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llava-v1.5-7b-4096-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert OCR system for extracting receipt data. Analyze the receipt image and extract the following information in JSON format:
            {
              "merchant": "Business name",
              "amount": "Total amount as number",
              "date": "Date in YYYY-MM-DD format",
              "items": ["Array of item names"],
              "category": "Suggested category (Food & Dining, Transportation, Shopping, etc.)",
              "tax": "Tax amount as number if visible",
              "currency": "Currency code (USD, EUR, etc.)",
              "confidence": "Confidence score 0-1"
            }
            
            Be accurate and only extract visible information. If something is unclear, use null.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract the receipt data from this image.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const groqData = await response.json();
    const extractedText = groqData.choices[0]?.message?.content;

    if (!extractedText) {
      throw new Error('No content returned from Groq API');
    }

    console.log('Raw OCR result:', extractedText);

    // Parse the JSON response from Groq
    let receiptData;
    try {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        receiptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Fallback: extract basic info with regex
      receiptData = {
        merchant: extractedText.match(/merchant[\":]?\s*[\"']([^\"']+)[\"']/i)?.[1] || null,
        amount: parseFloat(extractedText.match(/amount[\":]?\s*(\d+\.?\d*)/i)?.[1] || '0') || null,
        date: extractedText.match(/date[\":]?\s*[\"']([^\"']+)[\"']/i)?.[1] || null,
        category: 'Other',
        confidence: 0.5
      };
    }

    console.log('Parsed receipt data:', receiptData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: receiptData,
        rawText: extractedText 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in OCR processing:', error);
    return new Response(
      JSON.stringify({ 
        error: 'OCR processing failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
