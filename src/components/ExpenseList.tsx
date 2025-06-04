
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useProfile } from "@/hooks/useProfile";
import { ExpenseListSkeleton } from "./LoadingSkeleton";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
  currency?: {
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
  };
}

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

// Memoized expense item component
const ExpenseItem = React.memo(({ 
  expense, 
  userCurrency, 
  profileCurrencyCode, 
  onDelete 
}: {
  expense: Expense;
  userCurrency: any;
  profileCurrencyCode?: string;
  onDelete: (id: string) => void;
}) => (
  <Card className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-700/60 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-medium dark:text-white">{expense.description}</h3>
          <Badge variant="secondary" className="text-xs">
            {expense.category}
          </Badge>
          {expense.currency && expense.currency.code !== profileCurrencyCode && (
            <Badge variant="outline" className="text-xs">
              {expense.currency.code}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <span>{new Date(expense.date).toLocaleDateString()}</span>
          {expense.notes && (
            <span className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {expense.notes}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold dark:text-white">
          {expense.currency 
            ? formatCurrency(expense.amount, expense.currency)
            : formatCurrency(expense.amount, userCurrency)
          }
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(expense.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </Card>
));

ExpenseItem.displayName = 'ExpenseItem';

export const ExpenseList = React.memo(({ expenses, onDeleteExpense }: ExpenseListProps) => {
  const { profile, loading: profileLoading } = useProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Memoize categories extraction
  const categories = useMemo(() => 
    Array.from(new Set(expenses.map(e => e.category))), 
    [expenses]
  );

  // Memoize filtered and sorted expenses
  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "amount":
            return b.amount - a.amount;
          case "category":
            return a.category.localeCompare(b.category);
          default:
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
      });
  }, [expenses, searchTerm, filterCategory, sortBy]);

  // Memoize total calculation
  const totalFiltered = useMemo(() => 
    filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredAndSortedExpenses]
  );

  // Show loading skeleton while profile is loading
  if (profileLoading) {
    return <ExpenseListSkeleton />;
  }

  const userCurrency = profile?.currencies || { symbol: '$', decimal_places: 2 };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date (Newest)</SelectItem>
              <SelectItem value="amount">Amount (Highest)</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {filteredAndSortedExpenses.length} of {expenses.length} expenses
          </p>
          <p className="text-sm font-medium dark:text-white">
            Total: <span className="text-lg">
              {formatCurrency(totalFiltered, userCurrency)}
            </span>
          </p>
        </div>
      </Card>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredAndSortedExpenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            userCurrency={userCurrency}
            profileCurrencyCode={profile?.currencies?.code}
            onDelete={onDeleteExpense}
          />
        ))}

        {filteredAndSortedExpenses.length === 0 && (
          <Card className="p-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-center">
            <p className="text-gray-500 dark:text-gray-400">No expenses found matching your criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
});

ExpenseList.displayName = 'ExpenseList';
