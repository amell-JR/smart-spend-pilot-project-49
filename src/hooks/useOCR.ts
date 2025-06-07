
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

export const useOCR = () => {
  const [processing, setProcessing] = useState(false);
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
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
      console.log('Starting OCR processing...');
      
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

      if (!data?.success) {
        throw new Error(data?.error || 'OCR processing failed');
      }

      console.log('OCR processing successful:', data.data);
      setOcrData(data.data);
      
      toast({
        title: "Success",
        description: "Receipt processed successfully",
      });

      return data.data;
    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process receipt",
        variant: "destructive"
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const resetOCR = () => {
    setOcrData(null);
  };

  return {
    processing,
    ocrData,
    processReceipt,
    resetOCR
  };
};
