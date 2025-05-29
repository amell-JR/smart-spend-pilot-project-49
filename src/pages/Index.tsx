
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { Dashboard } from "@/components/Dashboard";
import { BudgetTracker } from "@/components/BudgetTracker";
import { Navigation } from "@/components/Navigation";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

export interface Budget {
  category: string;
  amount: number;
  spent: number;
}

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      description: "Grocery Shopping",
      amount: 85.50,
      date: "2025-05-28",
      category: "Food & Dining",
      notes: "Weekly groceries"
    },
    {
      id: "2", 
      description: "Gas Station",
      amount: 45.00,
      date: "2025-05-27",
      category: "Transportation"
    },
    {
      id: "3",
      description: "Coffee Shop",
      amount: 4.75,
      date: "2025-05-27",
      category: "Food & Dining"
    }
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    { category: "Food & Dining", amount: 400, spent: 90.25 },
    { category: "Transportation", amount: 200, spent: 45.00 },
    { category: "Entertainment", amount: 150, spent: 0 },
    { category: "Shopping", amount: 300, spent: 0 }
  ]);

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    
    // Update budget spent amounts
    setBudgets(prev => prev.map(budget => 
      budget.category === expense.category 
        ? { ...budget, spent: budget.spent + expense.amount }
        : budget
    ));
    
    setShowExpenseForm(false);
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      setBudgets(prev => prev.map(budget => 
        budget.category === expense.category 
          ? { ...budget, spent: Math.max(0, budget.spent - expense.amount) }
          : budget
      ));
    }
  };

  const updateBudget = (category: string, amount: number) => {
    setBudgets(prev => prev.map(budget => 
      budget.category === category 
        ? { ...budget, amount }
        : budget
    ));
  };

  const renderContent = () => {
    switch (activeView) {
      case "expenses":
        return <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />;
      case "budgets":
        return <BudgetTracker budgets={budgets} onUpdateBudget={updateBudget} />;
      default:
        return <Dashboard expenses={expenses} budgets={budgets} />;
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
            <Button 
              onClick={() => setShowExpenseForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
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
          onSubmit={addExpense}
          onCancel={() => setShowExpenseForm(false)}
        />
      )}
    </div>
  );
};

export default Index;
