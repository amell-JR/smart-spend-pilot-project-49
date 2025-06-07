
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

    console.log('Processing receipt OCR with vision model for user:', userId);

    // Use Groq's vision model for proper OCR processing
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: `You are an expert OCR system specialized in extracting data from receipt images. Analyze the receipt image and extract structured data. Return ONLY a valid JSON object with this exact format:
            {
              "merchant": "Business name or null",
              "amount": "Total amount as number or null",
              "date": "Date in YYYY-MM-DD format or null",
              "items": ["Array of item names or empty array"],
              "category": "Suggested category (Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Business, Other)",
              "tax": "Tax amount as number or null",
              "currency": "Currency code (USD, EUR, etc.) or null",
              "confidence": "Confidence score 0-1 based on image clarity and data extraction accuracy"
            }
            
            Guidelines:
            - Extract text exactly as it appears on the receipt
            - For dates, convert to YYYY-MM-DD format
            - For amounts, extract only numeric values
            - Set confidence based on image quality and text clarity
            - If you cannot read certain fields clearly, set them to null
            - Choose the most appropriate category from the provided list
            
            Return ONLY the JSON object, no other text.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract all the data from this receipt image and return it as structured JSON.'
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
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq Vision API error: ${response.status} - ${errorText}`);
      throw new Error(`Groq Vision API error: ${response.status} - ${errorText}`);
    }

    const groqData = await response.json();
    const extractedContent = groqData.choices[0]?.message?.content;

    if (!extractedContent) {
      throw new Error('No content returned from Groq Vision API');
    }

    console.log('Raw OCR result from vision model:', extractedContent);

    // Parse the JSON response from Groq Vision
    let receiptData;
    try {
      receiptData = JSON.parse(extractedContent);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw content:', extractedContent);
      
      // Fallback: create a basic structure for manual entry
      receiptData = {
        merchant: null,
        amount: null,
        date: new Date().toISOString().split('T')[0],
        items: [],
        category: 'Other',
        tax: null,
        currency: 'USD',
        confidence: 0.2
      };
    }

    // Validate and sanitize the extracted data
    receiptData = {
      merchant: receiptData.merchant || null,
      amount: receiptData.amount ? parseFloat(receiptData.amount) : null,
      date: receiptData.date || new Date().toISOString().split('T')[0],
      items: Array.isArray(receiptData.items) ? receiptData.items : [],
      category: receiptData.category || 'Other',
      tax: receiptData.tax ? parseFloat(receiptData.tax) : null,
      currency: receiptData.currency || 'USD',
      confidence: receiptData.confidence || 0.5
    };

    // Validate date format
    if (receiptData.date && !/^\d{4}-\d{2}-\d{2}$/.test(receiptData.date)) {
      console.warn('Invalid date format detected, using current date');
      receiptData.date = new Date().toISOString().split('T')[0];
    }

    // Ensure confidence is between 0 and 1
    if (receiptData.confidence < 0 || receiptData.confidence > 1) {
      receiptData.confidence = Math.max(0, Math.min(1, receiptData.confidence));
    }

    console.log('Parsed and validated receipt data:', receiptData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: receiptData,
        rawText: extractedContent,
        message: receiptData.confidence > 0.7 ? 'Receipt processed successfully' : 'Receipt processed with low confidence - please review'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in OCR processing:', error);
    return new Response(
      JSON.stringify({ 
        error: 'OCR processing failed', 
        details: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
