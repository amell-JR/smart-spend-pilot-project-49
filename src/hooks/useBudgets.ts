
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string;
  };
  spent?: number;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBudgets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories(name, color)
        `);

      if (error) throw error;

      // Calculate spent amounts for each budget
      const budgetsWithSpent = await Promise.all(
        (data || []).map(async (budget) => {
          const { data: expenses } = await supabase
            .from('expenses')
            .select('amount')
            .eq('category_id', budget.category_id)
            .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

          const spent = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
          return { ...budget, spent };
        })
      );

      setBudgets(budgetsWithSpent);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (categoryId: string, amount: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          category_id: categoryId,
          amount: amount,
          period: 'monthly'
        })
        .select(`
          *,
          categories(name, color)
        `)
        .single();

      if (error) throw error;
      
      // Refetch to get updated spent amounts
      fetchBudgets();
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
