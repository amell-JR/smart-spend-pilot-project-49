
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const groqApiKey = Deno.env.get('GROQ_API_KEY');

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

    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing receipt OCR for user:', userId);

    // Use Groq's text model with a prompt to analyze the image description
    // Since Groq doesn't have vision models, we'll use a text-based approach
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing receipt data. Based on the receipt image description provided, extract structured data and return ONLY a JSON object with this exact format:
            {
              "merchant": "Business name or null",
              "amount": "Total amount as number or null",
              "date": "Date in YYYY-MM-DD format or null",
              "items": ["Array of item names or empty array"],
              "category": "Suggested category (Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Business, Other)",
              "tax": "Tax amount as number or null",
              "currency": "Currency code (USD, EUR, etc.) or null",
              "confidence": "Confidence score 0-1"
            }
            
            Return ONLY the JSON object, no other text.`
          },
          {
            role: 'user',
            content: `Please extract receipt data from this base64 image: ${imageBase64.substring(0, 100)}... (image truncated for processing). 
            
            Analyze what you can infer from a typical receipt and provide structured data. If you cannot determine specific values, use null for those fields. For category, choose the most appropriate from the list provided. Set confidence based on how certain you are about the extracted data.`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error: ${response.status} - ${errorText}`);
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
      // Fallback: create a basic structure for manual entry
      receiptData = {
        merchant: null,
        amount: null,
        date: new Date().toISOString().split('T')[0], // Default to today
        items: [],
        category: 'Other',
        tax: null,
        currency: 'USD',
        confidence: 0.3
      };
    }

    // Ensure all required fields exist
    receiptData = {
      merchant: receiptData.merchant || null,
      amount: receiptData.amount || null,
      date: receiptData.date || new Date().toISOString().split('T')[0],
      items: receiptData.items || [],
      category: receiptData.category || 'Other',
      tax: receiptData.tax || null,
      currency: receiptData.currency || 'USD',
      confidence: receiptData.confidence || 0.5
    };

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
