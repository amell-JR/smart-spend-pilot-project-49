import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { EnhancedNavigation } from "@/components/enhanced/EnhancedNavigation";
import { EnhancedDashboard } from "@/components/enhanced/EnhancedDashboard";
import { ExpenseList } from "@/components/ExpenseList";
import { BudgetTracker } from "@/components/BudgetTracker";
import { Settings } from "@/components/Settings";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xl text-muted-foreground">Loading SpendWise...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Transform data for components
  const transformedExpenses = (expenses || []).map(expense => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    category: expense.categories?.name || 'Unknown',
    notes: expense.notes,
    currency: expense.currencies
  }));

  const transformedBudgetsForDashboard = (budgets || []).map(budget => ({
    id: budget.id,
    category_id: budget.category_id || '',
    amount: budget.amount,
    spent: budget.spent || 0,
    categories: budget.categories
  }));

  const transformedBudgetsForTracker = (budgets || []).map(budget => ({
    category: budget.categories?.name || 'Unknown',
    amount: budget.amount,
    spent: budget.spent || 0
  }));

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

  const getPageTitle = () => {
    switch (activeView) {
      case "expenses": return "Expenses";
      case "budgets": return "Budgets";
      case "settings": return "Settings";
      default: return "Dashboard";
    }
  };

  const getPageDescription = () => {
    switch (activeView) {
      case "expenses": return "Track and manage your spending";
      case "budgets": return "Set and monitor your budget goals";
      case "settings": return "Customize your account preferences";
      default: return "Your financial overview and insights";
    }
  };

  const renderContent = () => {
    const isLoading = expensesLoading || budgetsLoading;
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading {getPageTitle().toLowerCase()}...</p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case "expenses":
        return (
          <ErrorBoundary>
            <ExpenseList expenses={transformedExpenses} onDeleteExpense={deleteExpense} />
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
            <EnhancedDashboard expenses={transformedExpenses} budgets={transformedBudgetsForDashboard} />
          </ErrorBoundary>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gradient">
                  SpendWise
                </h1>
                <p className="text-muted-foreground">
                  Smart expense management for better financial health
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <EnhancedNavigation 
                  activeView={activeView} 
                  onViewChange={setActiveView}
                  className="animate-slide-up"
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">{getPageTitle()}</h2>
                    <p className="text-muted-foreground mt-1">{getPageDescription()}</p>
                  </div>
                  
                  {(activeView === "dashboard" || activeView === "expenses") && (
                    <Button 
                      onClick={() => setShowExpenseForm(true)}
                      className={cn(
                        "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                        "shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
                      )}
                      size="lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Expense
                    </Button>
                  )}
                </div>

                {/* Content */}
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Form Modal */}
        {showExpenseForm && (
          <div className="animate-scale-in">
            <ExpenseForm
              onSubmit={handleAddExpense}
              onCancel={() => setShowExpenseForm(false)}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Index;