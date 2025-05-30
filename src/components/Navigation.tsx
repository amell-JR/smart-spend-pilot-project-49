
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, CreditCard, Target, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Navigation = ({ activeView, onViewChange }: NavigationProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "expenses", label: "Expenses", icon: CreditCard },
    { id: "budgets", label: "Budgets", icon: Target },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <Card className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h2>
        <ThemeToggle />
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeView === item.id 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                  : "hover:bg-blue-50 dark:hover:bg-slate-700"
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </Card>
  );
};
