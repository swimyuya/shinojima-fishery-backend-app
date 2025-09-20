import { Package, Plus, Minus, AlertTriangle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  category: string;
  lastUpdated: string;
}

export default function InventoryManager() {
  // todo: remove mock functionality - mock inventory data
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: '網（大型）',
      currentStock: 3,
      minThreshold: 2,
      unit: '枚',
      category: '漁具',
      lastUpdated: '2024-09-18'
    },
    {
      id: '2', 
      name: 'ロープ（50m）',
      currentStock: 1,
      minThreshold: 3,
      unit: '本',
      category: '漁具',
      lastUpdated: '2024-09-15'
    },
    {
      id: '3',
      name: '燃料（軽油）',
      currentStock: 200,
      minThreshold: 100,
      unit: 'L',
      category: '燃料',
      lastUpdated: '2024-09-20'
    },
    {
      id: '4',
      name: '氷',
      currentStock: 50,
      minThreshold: 100,
      unit: 'kg',
      category: '保存材',
      lastUpdated: '2024-09-19'
    }
  ]);

  const [reminders] = useState([
    { id: '1', message: 'エンジンオイル交換（次回: 10月5日）', urgent: true },
    { id: '2', message: '船体点検（次回: 10月15日）', urgent: false },
    { id: '3', message: '無線機バッテリー交換（次回: 11月1日）', urgent: false }
  ]);

  const updateStock = (itemId: string, change: number) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            currentStock: Math.max(0, item.currentStock + change),
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : item
    ));
    console.log(`在庫更新: ${itemId}, 変更量: ${change}`);
  };

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minThreshold);

  return (
    <div className="space-y-6">
      {/* 在庫不足アラート */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              在庫不足の警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="destructive">
                    残り{item.currentStock}{item.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 在庫一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            在庫管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.map((item) => {
              const isLowStock = item.currentStock <= item.minThreshold;
              
              return (
                <div 
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    isLowStock ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-muted/30'
                  }`}
                  data-testid={`inventory-item-${item.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        カテゴリー: {item.category} | 最終更新: {item.lastUpdated}
                      </p>
                    </div>
                    {isLowStock && (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateStock(item.id, -1)}
                        disabled={item.currentStock === 0}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <div className="text-center min-w-20">
                        <p className="text-2xl font-bold" data-testid={`stock-${item.id}`}>
                          {item.currentStock}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.unit}</p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateStock(item.id, 1)}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">最低在庫</p>
                      <p className="font-medium">{item.minThreshold}{item.unit}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* メンテナンスリマインダー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            メンテナンス予定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div 
                key={reminder.id}
                className={`p-3 rounded-lg ${
                  reminder.urgent 
                    ? 'bg-destructive/5 border border-destructive/20' 
                    : 'bg-muted/50'
                }`}
                data-testid={`reminder-${reminder.id}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{reminder.message}</p>
                  {reminder.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      近日
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}