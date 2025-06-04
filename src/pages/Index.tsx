
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { ExpenseList } from "@/components/ExpenseList";
import { BudgetTracker } from "@/components/BudgetTracker";
import { Settings } from "@/components/Settings";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const { expenses, loading: expensesLoading, deleteExpense, addExpense } = useExpenses();
  const { budgets, loading: budgetsLoading, updateBudget } = useBudgets();
  const { categories } = useCategories();
  const [activeView, setActiveView] = useState("dashboard");
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  // Redirect to auth if user is not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Transform expenses data to match component interface
  const transformedExpenses = (expenses || []).map(expense => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    category: expense.categories?.name || 'Unknown',
    notes: expense.notes,
    currency: expense.currencies
  }));

  // Transform budgets data to match Dashboard component interface
  const transformedBudgetsForDashboard = (budgets || []).map(budget => ({
    id: budget.id,
    category_id: budget.category_id || '',
    amount: budget.amount,
    spent: budget.spent || 0,
    categories: budget.categories
  }));

  // Transform budgets data to match BudgetTracker component interface
  const transformedBudgetsForTracker = (budgets || []).map(budget => ({
    category: budget.categories?.name || 'Unknown',
    amount: budget.amount,
    spent: budget.spent || 0
  }));

  // Wrapper function to handle budget updates
  const handleUpdateBudget = async (category: string, amount: number) => {
    const originalBudget = budgets?.find(b => b.categories?.name === category);
    if (originalBudget) {
      await updateBudget(originalBudget.category_id!, amount, originalBudget.currency_id);
    }
  };

  const handleAddExpense = async (expenseData: {
    description: string;
    amount: number;
    date: string;
    category_id: string;
    notes?: string;
    currency_id: string;
  }) => {
    await addExpense(expenseData);
    setShowExpenseForm(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case "expenses":
        return (
          <ErrorBoundary>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Expenses</h2>
                <Button 
                  onClick={() => setShowExpenseForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </div>
              <ExpenseList expenses={transformedExpenses} onDeleteExpense={deleteExpense} />
            </div>
          </ErrorBoundary>
        );
      case "budgets":
        return (
          <ErrorBoundary>
            <BudgetTracker budgets={transformedBudgetsForTracker} onUpdateBudget={handleUpdateBudget} />
          </ErrorBoundary>
        );
      case "settings":
        return (
          <ErrorBoundary>
            <Settings />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Dashboard</h2>
                <Button 
                  onClick={() => setShowExpenseForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </div>
              <Dashboard expenses={transformedExpenses} budgets={transformedBudgetsForDashboard} />
            </div>
          </ErrorBoundary>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              SpendWise
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your expenses and manage your budget efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Navigation activeView={activeView} onViewChange={setActiveView} />
            </div>
            <div className="lg:col-span-3">
              {renderContent()}
            </div>
          </div>
        </div>

        {showExpenseForm && (
          <ExpenseForm
            onSubmit={handleAddExpense}
            onCancel={() => setShowExpenseForm(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Index;
