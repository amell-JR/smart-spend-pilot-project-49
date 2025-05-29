
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { Expense, Budget } from "@/pages/Index";

interface DashboardProps {
  expenses: Expense[];
  budgets: Budget[];
}

export const Dashboard = ({ expenses, budgets }: DashboardProps) => {
  // Calculate current month totals
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  // Prepare data for charts
  const categoryData = budgets.map(budget => ({
    name: budget.category,
    spent: budget.spent,
    budget: budget.amount,
    remaining: budget.amount - budget.spent
  }));

  const pieData = budgets
    .filter(budget => budget.spent > 0)
    .map(budget => ({
      name: budget.category,
      value: budget.spent
    }));

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444'];

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Spent This Month</p>
              <p className="text-2xl font-bold text-blue-900">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Remaining Budget</p>
              <p className="text-2xl font-bold text-green-900">${remainingBudget.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Budget</p>
              <p className="text-2xl font-bold text-purple-900">${totalBudget.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category - Pie Chart */}
        <Card className="p-6 bg-white/60 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No expenses to display
            </div>
          )}
        </Card>

        {/* Budget vs Spending - Bar Chart */}
        <Card className="p-6 bg-white/60 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Budget vs Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, ""]} />
              <Bar dataKey="budget" fill="#e2e8f0" name="Budget" />
              <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
        <div className="space-y-3">
          {recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-sm text-gray-600">{expense.category} • {expense.date}</p>
              </div>
              <p className="font-semibold text-lg">${expense.amount.toFixed(2)}</p>
            </div>
          ))}
          {recentExpenses.length === 0 && (
            <p className="text-gray-500 text-center py-8">No expenses yet. Add your first expense to get started!</p>
          )}
        </div>
      </Card>
    </div>
  );
};
