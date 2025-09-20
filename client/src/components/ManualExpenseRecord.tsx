import { useState } from "react";
import { Save, Calendar, DollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ManualExpenseRecord() {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    vendor: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    "燃料費", "餌代", "漁具・網", "船舶修理", "保険料", "税金", "その他"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.amount || !formData.vendor) {
      alert("カテゴリ、金額、支払先は必須項目です。");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          receiptImageUrl: null // 手動記録なのでレシート画像はなし
        })
      });
      
      if (response.ok) {
        const savedExpense = await response.json();
        console.log("手動経費記録保存成功:", savedExpense);
        alert(`📄 経費記録を手動登録しました！\n\n業者: ${formData.vendor}\n金額: ${formData.amount}円\nカテゴリ: ${formData.category}`);
        
        // React Queryキャッシュを無効化
        const { queryClient } = await import("@/lib/queryClient");
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
        
        // フォームをリセット
        setFormData({
          category: '',
          amount: '',
          vendor: '',
          description: '',
          expenseDate: new Date().toISOString().split('T')[0],
        });
      } else {
        const error = await response.text();
        throw new Error(`保存に失敗しました: ${error}`);
      }
    } catch (error) {
      console.error("手動経費記録保存エラー:", error);
      alert("❌ 経費記録の保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          手動で経費記録を入力
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">カテゴリ *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger data-testid="select-expense-category">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="amount">金額（円）*</Label>
            <Input
              id="amount"
              type="number"
              placeholder="例: 5000"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              data-testid="input-expense-amount"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="vendor">支払先 *</Label>
          <Input
            id="vendor"
            type="text"
            placeholder="例: 篠島石油, 漁具店など"
            value={formData.vendor}
            onChange={(e) => handleInputChange('vendor', e.target.value)}
            data-testid="input-expense-vendor"
          />
        </div>

        <div>
          <Label htmlFor="expense-date">支出日</Label>
          <Input
            id="expense-date"
            type="date"
            value={formData.expenseDate}
            onChange={(e) => handleInputChange('expenseDate', e.target.value)}
            data-testid="input-expense-date"
          />
        </div>

        <div>
          <Label htmlFor="description">詳細・備考</Label>
          <Textarea
            id="description"
            placeholder="購入内容や詳細があれば記入してください"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="min-h-20"
            data-testid="textarea-expense-description"
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12"
          data-testid="button-submit-manual-expense"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              保存中...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              経費記録を保存
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}