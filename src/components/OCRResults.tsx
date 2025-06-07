
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, Edit3, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  rawText?: string;
}

export const OCRResults = ({ data, onApprove, onEdit, rawText }: OCRResultsProps) => {
  const { categories } = useCategories();
  const [editMode, setEditMode] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
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

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return { variant: 'secondary' as const, text: 'Unknown', color: 'gray' };
    
    if (confidence >= 0.8) return { variant: 'default' as const, text: 'High', color: 'green' };
    if (confidence >= 0.6) return { variant: 'secondary' as const, text: 'Medium', color: 'yellow' };
    return { variant: 'destructive' as const, text: 'Low', color: 'red' };
  };

  const confidenceBadge = getConfidenceBadge(data.confidence);

  return (
    <Card className="p-6 bg-white dark:bg-slate-800">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold dark:text-white">OCR Results</h3>
            <Badge variant={confidenceBadge.variant}>
              {confidenceBadge.text} Confidence
              {data.confidence && ` (${Math.round(data.confidence * 100)}%)`}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {rawText && (
              <Button variant="ghost" size="sm" onClick={() => setShowRawData(!showRawData)}>
                {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}>
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {data.confidence && data.confidence < 0.7 && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Low confidence detected. Please review the extracted data carefully and make corrections as needed.
            </AlertDescription>
          </Alert>
        )}

        {showRawData && rawText && (
          <Card className="p-3 bg-gray-50 dark:bg-slate-700">
            <div className="text-sm">
              <Label className="font-medium">Raw OCR Data:</Label>
              <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
                {rawText}
              </pre>
            </div>
          </Card>
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
                className="mt-1"
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md mt-1">
                {formData.description || (
                  <span className="text-gray-400 italic">Not detected</span>
                )}
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
                className="mt-1"
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md mt-1">
                {formData.amount ? (
                  <span className="font-medium">
                    {data.currency || '$'}{formData.amount}
                    {data.tax && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Tax: {data.currency || '$'}{data.tax})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Not detected</span>
                )}
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
                className="mt-1"
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md mt-1">
                {formData.date ? (
                  new Date(formData.date).toLocaleDateString()
                ) : (
                  <span className="text-gray-400 italic">Not detected</span>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            {editMode ? (
              <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                <SelectTrigger className="mt-1">
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
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md mt-1">
                {categories.find(c => c.id === formData.category_id)?.name || 
                 data.category || 
                 <span className="text-gray-400 italic">Not detected</span>}
              </div>
            )}
          </div>
        </div>

        {(formData.notes || editMode) && (
          <div>
            <Label htmlFor="notes">Items / Notes</Label>
            {editMode ? (
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Items or additional notes"
                rows={3}
                className="mt-1"
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-md mt-1">
                {formData.notes || (
                  <span className="text-gray-400 italic">No items detected</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onEdit} className="flex-1">
            Start Over
          </Button>
          <Button 
            onClick={handleApprove} 
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={!formData.description || !formData.amount || !formData.date || !formData.category_id}
          >
            <Check className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>
    </Card>
  );
};
