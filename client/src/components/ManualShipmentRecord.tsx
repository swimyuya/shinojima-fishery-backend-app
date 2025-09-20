import { useState } from "react";
import { Save, Calendar, Fish, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ManualShipmentRecord() {
  const [formData, setFormData] = useState({
    fishSpecies: '',
    quantity: '',
    destination: '篠島漁協',
    totalAmount: '',
    shipmentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fishOptions = [
    "マダイ", "クロダイ", "スズキ", "イサキ", "アジ", "サバ", "タコ", "エビ", "カニ", "その他"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.fishSpecies || !formData.quantity) {
      alert("魚種と数量は必須項目です。");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const savedShipment = await response.json();
        console.log("手動出荷記録保存成功:", savedShipment);
        alert(`📝 出荷記録を手動登録しました！\n\n魚種: ${formData.fishSpecies}\n数量: ${formData.quantity}`);
        
        // React Queryキャッシュを無効化
        const { queryClient } = await import("@/lib/queryClient");
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
        
        // フォームをリセット
        setFormData({
          fishSpecies: '',
          quantity: '',
          destination: '篠島漁協',
          totalAmount: '',
          shipmentDate: new Date().toISOString().split('T')[0],
          notes: ''
        });
      } else {
        const error = await response.text();
        throw new Error(`保存に失敗しました: ${error}`);
      }
    } catch (error) {
      console.error("手動記録保存エラー:", error);
      alert("❌ 出荷記録の保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fish className="w-5 h-5" />
          手動で出荷記録を入力
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fish-species">魚種 *</Label>
            <Select value={formData.fishSpecies} onValueChange={(value) => handleInputChange('fishSpecies', value)}>
              <SelectTrigger data-testid="select-fish-species">
                <SelectValue placeholder="魚種を選択" />
              </SelectTrigger>
              <SelectContent>
                {fishOptions.map((fish) => (
                  <SelectItem key={fish} value={fish}>
                    {fish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="quantity">数量 *</Label>
            <Input
              id="quantity"
              type="text"
              placeholder="例: 12.5kg"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              data-testid="input-quantity"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="destination">出荷先</Label>
            <Input
              id="destination"
              type="text"
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              data-testid="input-destination"
            />
          </div>
          
          <div>
            <Label htmlFor="total-amount">金額（円）</Label>
            <Input
              id="total-amount"
              type="text"
              placeholder="例: 25000"
              value={formData.totalAmount}
              onChange={(e) => handleInputChange('totalAmount', e.target.value)}
              data-testid="input-total-amount"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="shipment-date">出荷日</Label>
          <Input
            id="shipment-date"
            type="date"
            value={formData.shipmentDate}
            onChange={(e) => handleInputChange('shipmentDate', e.target.value)}
            data-testid="input-shipment-date"
          />
        </div>

        <div>
          <Label htmlFor="notes">メモ・備考</Label>
          <Textarea
            id="notes"
            placeholder="特記事項があれば記入してください"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="min-h-20"
            data-testid="textarea-notes"
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12"
          data-testid="button-submit-manual-shipment"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              保存中...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              出荷記録を保存
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}