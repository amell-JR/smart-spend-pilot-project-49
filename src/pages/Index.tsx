
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { ExpenseList } from "@/components/ExpenseList";
import { BudgetTracker } from "@/components/BudgetTracker";
import { Settings } from "@/components/Settings";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // This will be handled by the router, but just in case
    return null;
  }

  const renderContent = () => {
    switch (activeView) {
      case "expenses":
        return <ExpenseList />;
      case "budgets":
        return <BudgetTracker />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            SpendWise
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your expenses and manage your budget efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Navigation activeView={activeView} onViewChange={setActiveView} />
          </div>
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
