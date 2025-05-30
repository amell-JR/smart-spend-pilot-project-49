
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Save, User, Palette } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useToast } from "@/hooks/use-toast";

export const Settings = () => {
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const { currencies, loading: currenciesLoading } = useCurrencies();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency_id || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
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
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading || currenciesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Profile Settings */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Profile</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
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

      {/* Currency Settings */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Currency & Display</h3>
        </div>
        
        <div className="space-y-4">
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
                      <span className="text-gray-500">- {currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              This will be used for all new expenses and budgets
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
