
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrency } from "@/utils/currency";

interface ExpenseFormProps {
  onSubmit: (expense: {
    description: string;
    amount: number;
    date: string;
    category: string;
    notes?: string;
    currency_id: string;
  }) => void;
  onCancel: () => void;
  categories: string[];
}

export const ExpenseForm = ({ onSubmit, onCancel, categories }: ExpenseFormProps) => {
  const { profile } = useProfile();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !profile?.currency_id) return;

    onSubmit({
      description,
      amount: parseFloat(amount),
      date,
      category,
      notes: notes || undefined,
      currency_id: profile.currency_id
    });
  };

  const currencySymbol = profile?.currencies?.symbol || '$';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add New Expense</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you spend on?"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">
              Amount ({currencySymbol})
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
                required
              />
            </div>
            {amount && profile?.currencies && (
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(parseFloat(amount) || 0, profile.currencies)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={!description || !amount || !category}
            >
              Add Expense
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
