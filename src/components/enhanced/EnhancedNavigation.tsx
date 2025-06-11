import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  CreditCard, 
  Target, 
  Settings, 
  Home,
  TrendingUp,
  Wallet,
  User
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface EnhancedNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

export const EnhancedNavigation = ({ activeView, onViewChange, className }: EnhancedNavigationProps) => {
  const { user, signOut } = useAuth();

  const navItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: Home,
      description: "Overview & insights"
    },
    { 
      id: "expenses", 
      label: "Expenses", 
      icon: CreditCard,
      description: "Track spending"
    },
    { 
      id: "budgets", 
      label: "Budgets", 
      icon: Target,
      description: "Manage budgets"
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: Settings,
      description: "Account & preferences"
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* User Profile Section */}
      <Card className="glass-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-600" />
            <p className="font-medium">Active</p>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <Wallet className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="font-medium">Premium</p>
          </div>
        </div>
      </Card>

      {/* Navigation Items */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
          <Badge variant="secondary" className="text-xs">
            SpendWise
          </Badge>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                    : "hover:bg-muted/50 text-foreground hover:text-foreground"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                  <div className="flex-1 text-left">
                    <div className={cn(
                      "font-medium",
                      isActive ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {item.label}
                    </div>
                    <div className={cn(
                      "text-xs",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card p-4">
        <h3 className="font-medium text-foreground mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs hover-lift"
            onClick={() => onViewChange("expenses")}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs hover-lift"
            onClick={() => onViewChange("budgets")}
          >
            <Target className="w-4 h-4 mr-2" />
            Set Budget
          </Button>
        </div>
      </Card>

      {/* Sign Out */}
      <Card className="glass-card p-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
          onClick={signOut}
        >
          Sign Out
        </Button>
      </Card>
    </div>
  );
};