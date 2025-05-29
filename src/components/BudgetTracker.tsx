import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Edit2, Check, X, TrendingUp, AlertTriangle } from "lucide-react";

interface Budget {
  category: string;
  amount: number;
  spent: number;
}

interface BudgetTrackerProps {
  budgets: Budget[];
  onUpdateBudget: (category: string, amount: number) => void;
}

export const BudgetTracker = ({ budgets, onUpdateBudget }: BudgetTrackerProps) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

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

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return { status: "danger", color: "text-red-600", bgColor: "bg-red-50" };
    if (percentage >= 75) return { status: "warning", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    return { status: "good", color: "text-green-600", bgColor: "bg-green-50" };
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Budget Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Budget Overview</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Budget</p>
            <p className="text-2xl font-bold text-blue-900">${totalBudget.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Spent: ${totalSpent.toFixed(2)}</span>
            <span>Remaining: ${(totalBudget - totalSpent).toFixed(2)}</span>
          </div>
          <Progress value={overallPercentage} className="h-3" />
          <p className="text-sm text-gray-600 text-center">
            {overallPercentage.toFixed(1)}% of total budget used
          </p>
        </div>
      </Card>

      {/* Individual Budget Categories */}
      <div className="grid gap-4">
        {budgets.map((budget) => {
          const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
          const remaining = budget.amount - budget.spent;
          const budgetStatus = getBudgetStatus(budget.spent, budget.amount);
          const isEditing = editingCategory === budget.category;

          return (
            <Card key={budget.category} className={`p-6 ${budgetStatus.bgColor} border-2 transition-colors`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-lg">{budget.category}</h3>
                  {percentage >= 90 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Over Budget
                    </Badge>
                  )}
                  {percentage >= 75 && percentage < 90 && (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
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
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-24"
                      />
                      <Button
                        size="sm"
                        onClick={() => saveEdit(budget.category)}
                        className="p-1 h-8 w-8"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEdit}
                        className="p-1 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-lg">${budget.amount.toFixed(2)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(budget.category, budget.amount)}
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
                  <span className={budgetStatus.color}>
                    Spent: ${budget.spent.toFixed(2)}
                  </span>
                  <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                    {remaining >= 0 ? "Remaining" : "Over"}: ${Math.abs(remaining).toFixed(2)}
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-3"
                />
                
                <p className="text-sm text-gray-600 text-center">
                  {percentage.toFixed(1)}% used
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
