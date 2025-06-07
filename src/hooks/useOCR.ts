
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface OCRData {
  merchant?: string;
  amount?: number;
  date?: string;
  items?: string[];
  category?: string;
  tax?: number;
  currency?: string;
  confidence?: number;
}

interface OCRResponse {
  success: boolean;
  data?: OCRData;
  rawText?: string;
  message?: string;
  error?: string;
  details?: string;
}

export const useOCR = () => {
  const [processing, setProcessing] = useState(false);
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const processReceipt = async (imageBase64: string): Promise<OCRData | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to process receipts",
        variant: "destructive"
      });
      return null;
    }

    setProcessing(true);
    try {
      console.log('Starting OCR processing with vision model...');
      
      const { data, error } = await supabase.functions.invoke('ocr-receipt', {
        body: {
          imageBase64,
          userId: user.id
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const response = data as OCRResponse;

      if (!response?.success) {
        throw new Error(response?.error || response?.details || 'OCR processing failed');
      }

      console.log('OCR processing successful:', response.data);
      setOcrData(response.data || null);
      setRawText(response.rawText || null);
      
      // Show appropriate toast based on confidence
      const confidence = response.data?.confidence || 0;
      toast({
        title: confidence > 0.7 ? "Success" : "Receipt Processed",
        description: response.message || (
          confidence > 0.7 
            ? "Receipt processed successfully" 
            : "Receipt processed with low confidence - please review the extracted data"
        ),
        variant: confidence > 0.7 ? "default" : "destructive"
      });

      return response.data || null;
    } catch (error) {
      console.error('OCR processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to process receipt";
      
      toast({
        title: "Error",
        description: errorMessage.includes('Vision API') 
          ? "Failed to process receipt image. Please try again or use manual entry."
          : errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const resetOCR = () => {
    setOcrData(null);
    setRawText(null);
  };

  return {
    processing,
    ocrData,
    rawText,
    processReceipt,
    resetOCR
  };
};
