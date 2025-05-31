
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Save, User, Palette, Moon, Sun } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeProvider";

export const Settings = () => {
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const { currencies, loading: currenciesLoading } = useCurrencies();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [saving, setSaving] = useState(false);

  // Update local state when profile data loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setSelectedCurrency(profile.currency_id || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!selectedCurrency) {
      toast({
        title: "Error",
        description: "Please select a currency.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        currency_id: selectedCurrency
      });
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'System';
    }
  };

  if (profileLoading || currenciesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
      </div>

      {/* Profile Settings */}
      <Card className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h3 className="text-lg font-semibold dark:text-white">Profile</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="bg-gray-50 dark:bg-slate-700"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h3 className="text-lg font-semibold dark:text-white">Appearance</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {theme === 'light' && <Sun className="w-4 h-4" />}
                    {theme === 'dark' && <Moon className="w-4 h-4" />}
                    {theme === 'system' && <Palette className="w-4 h-4" />}
                    {getThemeLabel(theme)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose your preferred color scheme
            </p>
          </div>

          <div>
            <Label htmlFor="currency">Default Currency</Label>
            <Select 
              value={selectedCurrency} 
              onValueChange={setSelectedCurrency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-gray-500 dark:text-gray-400">- {currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This will be used for all new expenses and budgets
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving || !selectedCurrency}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
