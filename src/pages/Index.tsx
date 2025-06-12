"use client"

import React from "react"

import { useState, useCallback, useMemo, Suspense } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useExpenses } from "@/hooks/useExpenses"
import { useBudgets } from "@/hooks/useBudgets"
import { useCategories } from "@/hooks/useCategories"
import { EnhancedNavigation } from "@/components/enhanced/EnhancedNavigation"
import { EnhancedDashboard } from "@/components/enhanced/EnhancedDashboard"
import { ExpenseForm } from "@/components/ExpenseForm"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Sparkles, TrendingUp, DollarSign, Target, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Lazy load components for better performance
const LazyExpenseList = React.lazy(() =>
  import("@/components/ExpenseList").then((module) => ({ default: module.ExpenseList })),
)
const LazyBudgetTracker = React.lazy(() =>
  import("@/components/BudgetTracker").then((module) => ({ default: module.BudgetTracker })),
)
const LazySettings = React.lazy(() => import("@/components/Settings").then((module) => ({ default: module.Settings })))

interface TransformedExpense {
  id: string
  description: string
  amount: number
  date: string
  category: string
  notes?: string
  currency: any
}

interface TransformedBudget {
  id: string
  category_id: string
  amount: number
  spent: number
  categories: any
}

const Index = () => {
  const { user, loading } = useAuth()
  const { expenses, loading: expensesLoading, deleteExpense, addExpense } = useExpenses()
  const { budgets, loading: budgetsLoading, updateBudget } = useBudgets()
  const { categories } = useCategories()
  const { toast } = useToast()

  const [activeView, setActiveView] = useState("dashboard")
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  // Memoized data transformations for better performance
  const transformedExpenses = useMemo((): TransformedExpense[] => {
    return (expenses || []).map((expense) => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.categories?.name || "Unknown",
      notes: expense.notes,
      currency: expense.currencies,
    }))
  }, [expenses])

  const transformedBudgetsForDashboard = useMemo((): TransformedBudget[] => {
    return (budgets || []).map((budget) => ({
      id: budget.id,
      category_id: budget.category_id || "",
      amount: budget.amount,
      spent: budget.spent || 0,
      categories: budget.categories,
    }))
  }, [budgets])

  const transformedBudgetsForTracker = useMemo(() => {
    return (budgets || []).map((budget) => ({
      category: budget.categories?.name || "Unknown",
      amount: budget.amount,
      spent: budget.spent || 0,
    }))
  }, [budgets])

  // Calculate financial insights
  const financialInsights = useMemo(() => {
    const totalExpenses = transformedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalBudget = transformedBudgetsForDashboard.reduce((sum, budget) => sum + budget.amount, 0)
    const totalSpent = transformedBudgetsForDashboard.reduce((sum, budget) => sum + budget.spent, 0)
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return {
      totalExpenses,
      totalBudget,
      totalSpent,
      budgetUtilization,
      remainingBudget: totalBudget - totalSpent,
      isOverBudget: totalSpent > totalBudget,
    }
  }, [transformedExpenses, transformedBudgetsForDashboard])

  // Optimized handlers with useCallback
  const handleUpdateBudget = useCallback(
    async (category: string, amount: number) => {
      try {
        const originalBudget = budgets?.find((b) => b.categories?.name === category)
        if (originalBudget) {
          await updateBudget(originalBudget.category_id!, amount, originalBudget.currency_id)
          toast({
            title: "Budget Updated",
            description: `Budget for ${category} has been updated successfully.`,
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update budget. Please try again.",
          variant: "destructive",
        })
      }
    },
    [budgets, updateBudget, toast],
  )

  const handleAddExpense = useCallback(
    async (expenseData: {
      description: string
      amount: number
      date: string
      category_id: string
      notes?: string
      currency_id: string
    }) => {
      try {
        await addExpense(expenseData)
        setShowExpenseForm(false)
        toast({
          title: "Expense Added",
          description: "Your expense has been recorded successfully.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add expense. Please try again.",
          variant: "destructive",
        })
      }
    },
    [addExpense, toast],
  )

  const handleDeleteExpense = useCallback(
    async (expenseId: string) => {
      try {
        await deleteExpense(expenseId)
        toast({
          title: "Expense Deleted",
          description: "The expense has been removed successfully.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete expense. Please try again.",
          variant: "destructive",
        })
      }
    },
    [deleteExpense, toast],
  )

  const getPageTitle = useCallback(() => {
    switch (activeView) {
      case "expenses":
        return "Expenses"
      case "budgets":
        return "Budgets"
      case "settings":
        return "Settings"
      default:
        return "Dashboard"
    }
  }, [activeView])

  const getPageDescription = useCallback(() => {
    switch (activeView) {
      case "expenses":
        return "Track and manage your spending"
      case "budgets":
        return "Set and monitor your budget goals"
      case "settings":
        return "Customize your account preferences"
      default:
        return "Your financial overview and insights"
    }
  }, [activeView])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xl text-muted-foreground">Loading SpendWise...</p>
        </div>
      </div>
    )
  }

  // Authentication check
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const renderContent = () => {
    const isLoading = expensesLoading || budgetsLoading

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading {getPageTitle().toLowerCase()}...</p>
          </div>
        </div>
      )
    }

    switch (activeView) {
      case "expenses":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <LazyExpenseList expenses={transformedExpenses} onDeleteExpense={handleDeleteExpense} />
          </Suspense>
        )
      case "budgets":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <LazyBudgetTracker budgets={transformedBudgetsForTracker} onUpdateBudget={handleUpdateBudget} />
          </Suspense>
        )
      case "settings":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <LazySettings />
          </Suspense>
        )
      default:
        return (
          <EnhancedDashboard
            expenses={transformedExpenses}
            budgets={transformedBudgetsForDashboard}
            insights={financialInsights}
          />
        )
    }
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            {/* Enhanced Header with Financial Summary */}
            <div className="mb-8 animate-fade-in">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      SpendWise
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      Smart expense management for better financial health
                    </p>
                  </div>
                </div>

                {/* Quick Financial Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                        <p className="text-lg font-bold">${financialInsights.totalBudget.toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Spent</p>
                        <p className="text-lg font-bold">${financialInsights.totalSpent.toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Budget Usage</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold">{financialInsights.budgetUtilization.toFixed(1)}%</p>
                          {financialInsights.isOverBudget && (
                            <Badge variant="destructive" className="text-xs">
                              <Bell className="w-3 h-3 mr-1" />
                              Over
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Enhanced Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <EnhancedNavigation
                    activeView={activeView}
                    onViewChange={setActiveView}
                    className="animate-slide-up"
                    insights={financialInsights}
                  />
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  {/* Enhanced Page Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{getPageTitle()}</h2>
                      <p className="text-muted-foreground mt-1">{getPageDescription()}</p>
                    </div>

                    {(activeView === "dashboard" || activeView === "expenses") && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => setShowExpenseForm(true)}
                            className={cn(
                              "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                              "shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
                            )}
                            size="lg"
                            aria-label="Add new expense"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Expense
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Record a new expense</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Content with Error Boundary */}
                  <ErrorBoundary>
                    <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                      {renderContent()}
                    </div>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Expense Form Modal */}
          {showExpenseForm && (
            <div className="fixed inset-0 z-50 animate-scale-in">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowExpenseForm(false)}
              />
              <div className="relative">
                <ExpenseForm
                  onSubmit={handleAddExpense}
                  onCancel={() => setShowExpenseForm(false)}
                  categories={categories}
                />
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default Index