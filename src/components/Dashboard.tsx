
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency } from "@/utils/currency";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  spent?: number;
  categories?: {
    name: string;
    color: string;
  };
}

interface DashboardProps {
  expenses: Expense[];
  budgets: Budget[];
}

export const Dashboard = ({ expenses = [], budgets = [] }: DashboardProps) => {
  const { profile, loading: profileLoading } = useProfile();
  
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

  // Show loading state while profile is loading
  if (profileLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const userCurrency = profile?.currencies || { symbol: '$', decimal_places: 2 };

  // Prepare data for charts
  const categoryData = budgets.map(budget => ({
    name: budget.categories?.name || 'Unknown Category',
    spent: budget.spent || 0,
    budget: budget.amount,
    remaining: budget.amount - (budget.spent || 0)
  }));

  const pieData = budgets
    .filter(budget => (budget.spent || 0) > 0)
    .map(budget => ({
      name: budget.categories?.name || 'Unknown Category',
      value: budget.spent || 0
    }));

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444'];

  const recentExpenses = expenses.slice(0, 5);

  // Custom tooltip for charts that uses the user's currency
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg">
          <p className="font-medium dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value, userCurrency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Spent This Month</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(totalSpent, userCurrency)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Remaining Budget</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(remainingBudget, userCurrency)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Budget</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(totalBudget, userCurrency)}
              </p>
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
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Spending by Category</h3>
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
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No expenses to display
            </div>
          )}
        </Card>

        {/* Budget vs Spending - Bar Chart */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Budget vs Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                className="dark:fill-gray-300"
              />
              <YAxis className="dark:fill-gray-300" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="budget" fill="#e2e8f0" name="Budget" />
              <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Expenses</h3>
        <div className="space-y-3">
          {recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
              <div>
                <p className="font-medium dark:text-white">{expense.description}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{expense.category} • {expense.date}</p>
              </div>
              <p className="font-semibold text-lg dark:text-white">
                {formatCurrency(expense.amount, userCurrency)}
              </p>
            </div>
          ))}
          {recentExpenses.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No expenses yet. Add your first expense to get started!</p>
          )}
        </div>
      </Card>
    </div>
  );
};
