
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, CreditCard, Target, Settings } from "lucide-react";

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
    <Card className="p-4 bg-white/60 backdrop-blur-sm">
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
                  : "hover:bg-blue-50"
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
