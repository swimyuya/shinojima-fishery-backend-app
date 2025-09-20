import { TrendingUp, TrendingDown, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  // APIからリアルデータを取得
  const { data: dashboardData, isLoading, isError, error } = useQuery<{
    monthlyStats: {
      revenue: number;
      expenses: number;
      profit: number;
      shipments: number;
      revenueChange: number;
      expenseChange: number;
    };
    recentShipments: Array<{
      id: string;
      fishSpecies: string;
      quantity: string;
      totalAmount: string | null;
      shipmentDate: string;
    }>;
  }>({
    queryKey: ['/api/dashboard'],
    staleTime: 30000, // 30秒間キャッシュ
  });

  // エラー状態
  if (isError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive font-medium">データの読み込みに失敗しました</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error?.toString() || '不明なエラーが発生しました'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // データが読み込み中またはない場合のローディング状態
  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const monthlyStats = dashboardData.monthlyStats;
  const recentShipments = dashboardData.recentShipments;

  // 固定のアラート（実際の環境では別のAPIから取得）
  const alerts = [
    { id: 1, type: "grant", message: "新しい補助金申請期限が近づいています", urgent: true },
    { id: 2, type: "maintenance", message: "エンジンオイル交換の時期です", urgent: false },
    { id: 3, type: "inventory", message: "網の在庫が少なくなっています", urgent: false },
  ];

  return (
    <div className="space-y-6">
      {/* 月次サマリー */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今月の売上</p>
                <p className="text-2xl font-bold" data-testid="text-monthly-revenue">
                  ¥{monthlyStats.revenue.toLocaleString()}
                </p>
              </div>
              <div className={`flex items-center text-sm ${
                monthlyStats.revenueChange > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {monthlyStats.revenueChange > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(monthlyStats.revenueChange)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今月の経費</p>
                <p className="text-2xl font-bold" data-testid="text-monthly-expenses">
                  ¥{monthlyStats.expenses.toLocaleString()}
                </p>
              </div>
              <div className={`flex items-center text-sm ${
                monthlyStats.expenseChange < 0 ? "text-green-600" : "text-red-600"
              }`}>
                {monthlyStats.expenseChange < 0 ? (
                  <TrendingDown className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-1" />
                )}
                {Math.abs(monthlyStats.expenseChange)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 利益表示 */}
      <Card className="bg-primary/5">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">今月の利益</p>
          <p className="text-4xl font-bold text-primary mb-2" data-testid="text-monthly-profit">
            ¥{monthlyStats.profit.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            出荷回数: {monthlyStats.shipments}回
          </p>
        </CardContent>
      </Card>

      {/* アラート・通知 */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5" />
              お知らせ・アラート
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.urgent 
                    ? "bg-destructive/5 border-destructive/20" 
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{alert.message}</p>
                  {alert.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      急ぎ
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 最近の出荷記録 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              最近の出荷記録
            </span>
            <Button variant="ghost" size="sm" data-testid="button-view-all-shipments">
              すべて見る
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentShipments.length > 0 ? (
              recentShipments.map((shipment: any) => (
                <div 
                  key={shipment.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  data-testid={`shipment-${shipment.id}`}
                >
                  <div>
                    <p className="font-medium">{shipment.fishSpecies} - {shipment.quantity}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(shipment.shipmentDate).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <p className="font-bold">
                    {shipment.totalAmount ? `¥${parseFloat(shipment.totalAmount).toLocaleString()}` : '金額未設定'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>まだ出荷記録がありません</p>
                <p className="text-sm">記録タブから出荷記録を追加してください</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* クイックアクション */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-16"
          data-testid="button-monthly-report"
        >
          <div className="text-center">
            <p className="font-medium">月次レポート</p>
            <p className="text-xs text-muted-foreground">詳細を表示</p>
          </div>
        </Button>
        <Button 
          variant="outline" 
          className="h-16"
          data-testid="button-export-data"
        >
          <div className="text-center">
            <p className="font-medium">データ出力</p>
            <p className="text-xs text-muted-foreground">確定申告用</p>
          </div>
        </Button>
      </div>
    </div>
  );
}