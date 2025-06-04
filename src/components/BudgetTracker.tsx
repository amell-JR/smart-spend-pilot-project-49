
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Edit2, Check, X, TrendingUp, AlertTriangle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency } from "@/utils/currency";
import { BudgetTrackerSkeleton } from "./LoadingSkeleton";

interface Budget {
  category: string;
  amount: number;
  spent: number;
}

interface BudgetTrackerProps {
  budgets: Budget[];
  onUpdateBudget: (category: string, amount: number) => void;
}

// Memoized budget status function
const getBudgetStatus = (spent: number, budget: number) => {
  const percentage = (spent / budget) * 100;
  if (percentage >= 90) return { status: "danger", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" };
  if (percentage >= 75) return { status: "warning", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" };
  return { status: "good", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" };
};

// Memoized budget item component
const BudgetItem = React.memo(({ 
  budget, 
  userCurrency, 
  editingCategory, 
  editAmount, 
  onStartEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onEditAmountChange 
}: {
  budget: Budget;
  userCurrency: any;
  editingCategory: string | null;
  editAmount: string;
  onStartEdit: (category: string, amount: number) => void;
  onSaveEdit: (category: string) => void;
  onCancelEdit: () => void;
  onEditAmountChange: (value: string) => void;
}) => {
  const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - budget.spent;
  const budgetStatus = getBudgetStatus(budget.spent, budget.amount);
  const isEditing = editingCategory === budget.category;

  return (
    <Card className={`p-6 ${budgetStatus.bgColor} border-2 transition-colors`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-lg dark:text-white">{budget.category}</h3>
          {percentage >= 90 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Over Budget
            </Badge>
          )}
          {percentage >= 75 && percentage < 90 && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              <TrendingUp className="w-3 h-3" />
              Near Limit
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editAmount}
                onChange={(e) => onEditAmountChange(e.target.value)}
                className="w-24"
              />
              <Button
                size="sm"
                onClick={() => onSaveEdit(budget.category)}
                className="p-1 h-8 w-8"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelEdit}
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className="font-semibold text-lg dark:text-white">
                {formatCurrency(budget.amount, userCurrency)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStartEdit(budget.category, budget.amount)}
                className="p-1 h-8 w-8"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className={`${budgetStatus.color} dark:text-opacity-90`}>
            Spent: {formatCurrency(budget.spent, userCurrency)}
          </span>
          <span className={`${remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {remaining >= 0 ? "Remaining" : "Over"}: {formatCurrency(Math.abs(remaining), userCurrency)}
          </span>
        </div>
        
        <Progress 
          value={Math.min(percentage, 100)} 
          className="h-3"
        />
        
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          {percentage.toFixed(1)}% used
        </p>
      </div>
    </Card>
  );
});

BudgetItem.displayName = 'BudgetItem';

export const BudgetTracker = React.memo(({ budgets, onUpdateBudget }: BudgetTrackerProps) => {
  const { profile, loading: profileLoading } = useProfile();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  // Memoize totals calculation
  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    return { totalBudget, totalSpent, overallPercentage };
  }, [budgets]);

  const startEditing = (category: string, currentAmount: number) => {
    setEditingCategory(category);
    setEditAmount(currentAmount.toString());
  };

  const saveEdit = (category: string) => {
    const amount = parseFloat(editAmount);
    if (amount >= 0) {
      onUpdateBudget(category, amount);
    }
    setEditingCategory(null);
    setEditAmount("");
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditAmount("");
  };

  // Show loading skeleton while profile is loading
  if (profileLoading) {
    return <BudgetTrackerSkeleton />;
  }

  const { totalBudget, totalSpent, overallPercentage } = totals;
  const userCurrency = profile?.currencies || { symbol: '$', decimal_places: 2 };

  return (
    <div className="space-y-6">
      {/* Overall Budget Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Budget Overview</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Budget</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(totalBudget, userCurrency)}
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm dark:text-gray-300">
            <span>Spent: {formatCurrency(totalSpent, userCurrency)}</span>
            <span>Remaining: {formatCurrency(totalBudget - totalSpent, userCurrency)}</span>
          </div>
          <Progress value={overallPercentage} className="h-3" />
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            {overallPercentage.toFixed(1)}% of total budget used
          </p>
        </div>
      </Card>

      {/* Individual Budget Categories */}
      <div className="grid gap-4">
        {budgets.map((budget) => (
          <BudgetItem
            key={budget.category}
            budget={budget}
            userCurrency={userCurrency}
            editingCategory={editingCategory}
            editAmount={editAmount}
            onStartEdit={startEditing}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onEditAmountChange={setEditAmount}
          />
        ))}
      </div>
    </div>
  );
});

BudgetTracker.displayName = 'BudgetTracker';
