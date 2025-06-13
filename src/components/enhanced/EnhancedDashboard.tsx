import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
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

interface EnhancedDashboardProps {
  expenses: Expense[];
  budgets: Budget[];
}

const COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', 
  '#ec4899', '#ef4444', '#f59e0b', '#10b981'
];

const CustomTooltip = React.memo(({ active, payload, label, userCurrency }: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
  userCurrency: { symbol: string; decimal_places: number };
}) => {
  if (active && payload && payload.length) {
    return (
      <Card className="glass-card p-3 border shadow-lg">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatCurrency(entry.value, userCurrency)}
          </p>
        ))}
      </Card>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

export const EnhancedDashboard = React.memo(({ expenses = [], budgets = [] }: EnhancedDashboardProps) => {
  const { profile, loading: profileLoading } = useProfile();
  
  const calculatedData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
    });

    const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const lastMonthSpent = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const remainingBudget = totalBudget - totalSpent;
    const budgetUsagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    const spendingChange = lastMonthSpent > 0 
      ? ((totalSpent - lastMonthSpent) / lastMonthSpent) * 100 
      : 0;

    // Weekly spending trend
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayExpenses = currentMonthExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });
      const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayTotal
      });
    }
    
    return {
      currentMonthExpenses,
      totalSpent,
      lastMonthSpent,
      totalBudget,
      remainingBudget,
      budgetUsagePercentage,
      spendingChange,
      weeklyData
    };
  }, [expenses, budgets]);

  const chartData = useMemo(() => {
    const categoryData = budgets.map(budget => ({
      name: budget.categories?.name || 'Unknown Category',
      spent: budget.spent || 0,
      budget: budget.amount,
      remaining: budget.amount - (budget.spent || 0),
      percentage: budget.amount > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0
    }));

    const pieData = budgets
      .filter(budget => (budget.spent || 0) > 0)
      .map((budget, index) => ({
        name: budget.categories?.name || 'Unknown Category',
        value: budget.spent || 0,
        color: COLORS[index % COLORS.length]
      }));

    return { categoryData, pieData };
  }, [budgets]);

  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);

  if (profileLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const userCurrency = profile?.currencies || { symbol: '$', decimal_places: 2 };
  const { 
    totalSpent, 
    totalBudget, 
    remainingBudget, 
    budgetUsagePercentage, 
    spendingChange,
    weeklyData
  } = calculatedData;
  const { categoryData, pieData } = chartData;

  const getBudgetStatus = () => {
    if (budgetUsagePercentage >= 90) return { status: "danger", icon: AlertTriangle, color: "text-red-600" };
    if (budgetUsagePercentage >= 75) return { status: "warning", icon: TrendingUp, color: "text-yellow-600" };
    return { status: "good", icon: CheckCircle, color: "text-green-600" };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Spent This Month"
          value={formatCurrency(totalSpent, userCurrency)}
          change={{
            value: `${spendingChange >= 0 ? '+' : ''}${spendingChange.toFixed(1)}% from last month`,
            type: spendingChange > 0 ? "increase" : spendingChange < 0 ? "decrease" : "neutral"
          }}
          icon={DollarSign}
          trend={spendingChange > 0 ? "up" : spendingChange < 0 ? "down" : "neutral"}
        />

        <StatCard
          title="Remaining Budget"
          value={formatCurrency(remainingBudget, userCurrency)}
          icon={Wallet}
          trend={remainingBudget > 0 ? "up" : remainingBudget < 0 ? "down" : "neutral"}
        />

        <StatCard
          title="Budget Usage"
          value={`${budgetUsagePercentage.toFixed(1)}%`}
          icon={budgetStatus.icon}
          trend={budgetUsagePercentage < 75 ? "up" : budgetUsagePercentage < 90 ? "neutral" : "down"}
        />

        <StatCard
          title="Total Budget"
          value={formatCurrency(totalBudget, userCurrency)}
          icon={Target}
        />
      </div>

      {/* Budget Overview with Progress Ring */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Budget Overview</h3>
          <div className={`flex items-center gap-2 ${budgetStatus.color}`}>
            <budgetStatus.icon className="w-5 h-5" />
            <span className="text-sm font-medium">
              {budgetStatus.status === "good" ? "On Track" : 
               budgetStatus.status === "warning" ? "Near Limit" : "Over Budget"}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <ProgressRing 
              progress={Math.min(budgetUsagePercentage, 100)}
              size={200}
              strokeWidth={12}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {budgetUsagePercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Used</div>
              </div>
            </ProgressRing>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Budget</span>
              <span className="font-semibold text-lg">
                {formatCurrency(totalBudget, userCurrency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Spent</span>
              <span className="font-semibold text-lg">
                {formatCurrency(totalSpent, userCurrency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Remaining</span>
              <span className={`font-semibold text-lg ${
                remainingBudget >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}>
                {formatCurrency(Math.abs(remainingBudget), userCurrency)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Spending by Category</h3>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip userCurrency={userCurrency} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No expenses to display</p>
              </div>
            </div>
          )}
        </Card>

        {/* Budget vs Spending */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Budget vs Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                className="fill-muted-foreground"
              />
              <YAxis className="fill-muted-foreground" />
              <Tooltip content={<CustomTooltip userCurrency={userCurrency} />} />
              <Bar dataKey="budget" fill="#e2e8f0" name="Budget" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" fill="#3b82f6" name="Spent" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Weekly Spending Trend */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Weekly Spending Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="day" className="fill-muted-foreground" />
            <YAxis className="fill-muted-foreground" />
            <Tooltip content={<CustomTooltip userCurrency={userCurrency} />} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#3b82f6" 
              fill="url(#colorAmount)" 
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Expenses */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Expenses</h3>
        <div className="space-y-3">
          {recentExpenses.map((expense, index) => (
            <div 
              key={expense.id} 
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{expense.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-lg text-foreground">
                {formatCurrency(expense.amount, userCurrency)}
              </p>
            </div>
          ))}
          {recentExpenses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No expenses yet</p>
              <p className="text-sm">Add your first expense to get started!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
});

EnhancedDashboard.displayName = 'EnhancedDashboard';