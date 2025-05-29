
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, LogOut } from "lucide-react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { Dashboard } from "@/components/Dashboard";
import { BudgetTracker } from "@/components/BudgetTracker";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useBudgets } from "@/hooks/useBudgets";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  
  const { user, loading: authLoading, signOut } = useAuth();
  const { expenses, addExpense, deleteExpense, loading: expensesLoading } = useExpenses();
  const { categories, loading: categoriesLoading } = useCategories();
  const { budgets, updateBudget, loading: budgetsLoading } = useBudgets();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg text-gray-600">Loading SpendWise...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleAddExpense = async (expense: {
    description: string;
    amount: number;
    date: string;
    category: string;
    notes?: string;
  }) => {
    const category = categories.find(c => c.name === expense.category);
    if (!category) return;

    try {
      await addExpense({
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        category_id: category.id,
        notes: expense.notes
      });
      setShowExpenseForm(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleUpdateBudget = async (categoryName: string, amount: number) => {
    const category = categories.find(c => c.name === categoryName);
    if (!category) return;

    try {
      await updateBudget(category.id, amount);
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  // Transform data for components
  const transformedExpenses = expenses.map(expense => ({
    id: expense.id,
    description: expense.description,
    amount: Number(expense.amount),
    date: expense.date,
    category: expense.categories?.name || 'Unknown',
    notes: expense.notes
  }));

  const transformedBudgets = budgets.map(budget => ({
    category: budget.categories?.name || 'Unknown',
    amount: Number(budget.amount),
    spent: budget.spent || 0
  }));

  const renderContent = () => {
    if (expensesLoading || categoriesLoading || budgetsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      );
    }

    switch (activeView) {
      case "expenses":
        return <ExpenseList expenses={transformedExpenses} onDeleteExpense={deleteExpense} />;
      case "budgets":
        return <BudgetTracker budgets={transformedBudgets} onUpdateBudget={handleUpdateBudget} />;
      default:
        return <Dashboard expenses={transformedExpenses} budgets={transformedBudgets} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SpendWise
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowExpenseForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
              
              <Button
                variant="ghost"
                onClick={signOut}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation */}
          <div className="lg:w-64">
            <Navigation activeView={activeView} onViewChange={setActiveView} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm 
          onSubmit={handleAddExpense}
          onCancel={() => setShowExpenseForm(false)}
          categories={categories.map(c => c.name)}
        />
      )}
    </div>
  );
};

export default Index;
