
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency_id: string;
  period: string;
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
  spent?: number;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBudgets = async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Fetch budgets with proper user filtering
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          categories(name, color),
          currencies(code, name, symbol, decimal_places)
        `)
        .eq('user_id', user.id);

      if (budgetsError) {
        console.error('Error fetching budgets:', budgetsError);
        throw budgetsError;
      }

      // Use the optimized function to get spent amounts
      const { data: spentData, error: spentError } = await supabase
        .rpc('get_budget_spent_amounts', { user_uuid: user.id });

      if (spentError) {
        console.error('Error fetching spent amounts:', spentError);
        // Continue without spent amounts rather than failing completely
      }

      // Merge budgets with spent amounts
      const budgetsWithSpent = (budgetsData || []).map(budget => {
        const spentRecord = spentData?.find(s => s.category_id === budget.category_id);
        return {
          ...budget,
          spent: Number(spentRecord?.spent_amount || 0)
        };
      });

      setBudgets(budgetsWithSpent);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (categoryId: string, amount: number, currencyId: string) => {
    if (!user) return;

    // Validate inputs
    if (!categoryId || amount <= 0 || !currencyId) {
      throw new Error('Valid category, amount, and currency are required');
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          category_id: categoryId,
          amount: Number(amount),
          currency_id: currencyId,
          period: 'monthly',
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          categories(name, color),
          currencies(code, name, symbol, decimal_places)
        `)
        .single();

      if (error) {
        console.error('Error updating budget:', error);
        throw error;
      }
      
      // Refetch to get updated spent amounts
      await fetchBudgets();
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  return {
    budgets,
    loading,
    updateBudget,
    refetch: fetchBudgets
  };
};
