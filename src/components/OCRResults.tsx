
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check, Edit3, AlertCircle } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface OCRData {
  merchant?: string;
  amount?: number;
  date?: string;
  items?: string[];
  category?: string;
  tax?: number;
  currency?: string;
  confidence?: number;
}

interface OCRResultsProps {
  data: OCRData;
  onApprove: (approvedData: {
    description: string;
    amount: number;
    date: string;
    category_id: string;
    notes?: string;
  }) => void;
  onEdit: () => void;
}

export const OCRResults = ({ data, onApprove, onEdit }: OCRResultsProps) => {
  const { categories } = useCategories();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    description: data.merchant || '',
    amount: data.amount?.toString() || '',
    date: data.date || '',
    category_id: '',
    notes: data.items?.join(', ') || ''
  });

  useEffect(() => {
    // Auto-select category based on OCR suggestion
    if (data.category && categories.length > 0) {
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(data.category!.toLowerCase()) ||
        data.category!.toLowerCase().includes(cat.name.toLowerCase())
      );
      if (matchingCategory) {
        setFormData(prev => ({ ...prev, category_id: matchingCategory.id }));
      }
    }
  }, [data.category, categories]);

  const handleApprove = () => {
    if (!formData.description || !formData.amount || !formData.date || !formData.category_id) {
      alert('Please fill in all required fields');
      return;
    }

    onApprove({
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category_id: formData.category_id,
      notes: formData.notes || undefined
    });
  };

  const confidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6 bg-white dark:bg-slate-800">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold dark:text-white">OCR Results</h3>
          <div className="flex items-center gap-2">
            {data.confidence && (
              <span className={`text-sm ${confidenceColor(data.confidence)}`}>
                {Math.round(data.confidence * 100)}% confidence
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}>
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {data.confidence && data.confidence < 0.7 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Low confidence detected. Please review the extracted data carefully.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="description">Merchant / Description *</Label>
            {editMode ? (
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md">
                {formData.description || 'Not detected'}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount *</Label>
            {editMode ? (
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md">
                {formData.amount ? `$${formData.amount}` : 'Not detected'}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            {editMode ? (
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md">
                {formData.date || 'Not detected'}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            {editMode ? (
              <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md">
                {categories.find(c => c.id === formData.category_id)?.name || data.category || 'Not detected'}
              </div>
            )}
          </div>
        </div>

        {formData.notes && (
          <div>
            <Label htmlFor="notes">Items / Notes</Label>
            {editMode ? (
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Items or additional notes"
                rows={3}
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md">
                {formData.notes}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onEdit} className="flex-1">
            Start Over
          </Button>
          <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">
            <Check className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>
    </Card>
  );
};
