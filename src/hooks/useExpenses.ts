
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  currency_id: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string;
  };
  currencies?: {
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
  };
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          categories(name, color),
          currencies(code, name, symbol, decimal_places)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: {
    description: string;
    amount: number;
    date: string;
    category_id: string;
    currency_id: string;
    notes?: string;
  }) => {
    if (!user) return;

    // Validate required fields
    if (!expense.description?.trim() || expense.amount <= 0 || !expense.date || !expense.category_id || !expense.currency_id) {
      throw new Error('All required fields must be provided and valid');
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expense,
          user_id: user.id,
          amount: Number(expense.amount)
        }])
        .select(`
          *,
          categories(name, color),
          currencies(code, name, symbol, decimal_places)
        `)
        .single();

      if (error) {
        console.error('Error adding expense:', error);
        throw error;
      }
      setExpenses(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user || !id) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
    refetch: fetchExpenses
  };
};
