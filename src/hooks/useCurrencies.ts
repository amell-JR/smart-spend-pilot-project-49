
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api-client';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  created_at: string;
}

export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.withRetry(async (client) =>
        client
          .from('currencies')
          .select('*')
          .order('code')
      );

      if (error) throw error;
      setCurrencies(data || []);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  return {
    currencies,
    loading,
    refetch: fetchCurrencies
  };
};
