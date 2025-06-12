"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BarChart3,
  CreditCard,
  Target,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

interface FinancialInsights {
  totalExpenses: number
  totalBudget: number
  totalSpent: number
  budgetUtilization: number
  remainingBudget: number
  isOverBudget: boolean
}

interface NavigationProps {
  activeView: string
  onViewChange: (view: string) => void
  className?: string
  insights?: FinancialInsights
}

export const EnhancedNavigation = ({ activeView, onViewChange, className, insights }: NavigationProps) => {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Overview & insights",
      badge: insights?.isOverBudget ? "!" : null,
      badgeVariant: "destructive" as const,
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: CreditCard,
      description: "Track spending",
      badge: insights?.totalExpenses ? Math.floor(insights.totalExpenses).toString() : null,
      badgeVariant: "secondary" as const,
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: Target,
      description: "Manage limits",
      badge: insights?.budgetUtilization ? `${Math.floor(insights.budgetUtilization)}%` : null,
      badgeVariant: insights?.isOverBudget ? ("destructive" as const) : ("default" as const),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Preferences",
      badge: null,
      badgeVariant: "default" as const,
    },
  ]

  const getStatusIcon = () => {
    if (!insights) return null

    if (insights.isOverBudget) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    } else if (insights.budgetUtilization > 80) {
      return <TrendingUp className="w-4 h-4 text-yellow-500" />
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getStatusMessage = () => {
    if (!insights) return "Loading financial data..."

    if (insights.isOverBudget) {
      return "Over budget this month"
    } else if (insights.budgetUtilization > 80) {
      return "Approaching budget limit"
    } else {
      return "On track with budget"
    }
  }

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-0 shadow-xl",
          "transition-all duration-300 hover:shadow-2xl",
          className,
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
              <p className="text-sm text-muted-foreground">Financial overview</p>
            </div>
            <ThemeToggle />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Financial Status Summary */}
          {insights && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600">
                {getStatusIcon()}
                <div className="flex-1">
                  <p className="text-sm font-medium">{getStatusMessage()}</p>
                  <p className="text-xs text-muted-foreground">${insights.remainingBudget.toFixed(2)} remaining</p>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Budget Usage</span>
                  <span className="text-sm text-muted-foreground">{insights.budgetUtilization.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(insights.budgetUtilization, 100)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${insights.totalSpent.toFixed(2)} spent</span>
                  <span>${insights.totalBudget.toFixed(2)} budget</span>
                </div>
              </div>

              <Separator />
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start h-auto p-3 transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl"
                          : "hover:bg-blue-50 dark:hover:bg-slate-700 hover:scale-[1.02]",
                        "group relative overflow-hidden",
                      )}
                      onClick={() => onViewChange(item.id)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-white/20"
                              : "bg-blue-100 dark:bg-slate-600 group-hover:bg-blue-200 dark:group-hover:bg-slate-500",
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                              <Badge variant={item.badgeVariant} className="text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p
                            className={cn(
                              "text-xs transition-colors",
                              isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                            )}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Active indicator */}
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50 rounded-r-full" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>

          {/* Quick Stats */}
          {insights && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Quick Stats</h3>

                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Total Budget</span>
                    </div>
                    <span className="text-sm font-medium">${insights.totalBudget.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Total Spent</span>
                    </div>
                    <span className="text-sm font-medium">${insights.totalSpent.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">This Month</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export function Navigation() {
  return (
    <nav className="animate-fade-in glass fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2 hover-lift" href="/">
            <span className="hidden font-bold sm:inline-block">
              SmartSpend
            </span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {/* Existing navigation items */}
          </nav>
        </div>
        {/* Rest of the component */}
      </div>
    </nav>
  )
}