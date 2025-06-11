import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DivideIcon as LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  icon: LucideIcon;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  className,
  trend = "neutral"
}: StatCardProps) => {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground"
  };

  const changeColors = {
    increase: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
    decrease: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    neutral: "text-muted-foreground bg-muted"
  };

  return (
    <Card className={cn(
      "glass-card hover-lift p-6 transition-all duration-200",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            trendColors[trend]
          )}>
            {value}
          </p>
          {change && (
            <div className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              changeColors[change.type]
            )}>
              {change.value}
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          "bg-primary/10 text-primary"
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};