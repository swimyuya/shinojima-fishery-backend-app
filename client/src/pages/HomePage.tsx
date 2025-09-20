import { TrendingUp, FileEdit, Bot, DollarSign, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Dashboard from "@/components/Dashboard";
import GrantNotifications from "@/components/GrantNotifications";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-card-border p-4">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-2xl font-bold text-center text-primary">
            篠島漁業DX
          </h1>
          <p className="text-sm text-center text-muted-foreground mt-1">
            リアルタイム経営ダッシュボード
          </p>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-4 space-y-6">
        {/* メインダッシュボード */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              今月の経営状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dashboard />
          </CardContent>
        </Card>

        {/* 補助金通知 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-primary" />
              重要な通知
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GrantNotifications />
          </CardContent>
        </Card>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 gap-4">
          <Link href="/record">
            <Button 
              variant="outline" 
              className="h-16 justify-start w-full"
              data-testid="button-quick-record"
            >
              <FileEdit className="w-6 h-6 mr-4" />
              <div className="text-left">
                <p className="font-medium">記録・入力</p>
                <p className="text-xs text-muted-foreground">写真撮影・音声入力で出荷記録</p>
              </div>
            </Button>
          </Link>

          <Link href="/assistant">
            <Button 
              variant="outline" 
              className="h-16 justify-start w-full"
              data-testid="button-quick-assistant"
            >
              <Bot className="w-6 h-6 mr-4" />
              <div className="text-left">
                <p className="font-medium">AIアシスタント</p>
                <p className="text-xs text-muted-foreground">経営相談・質問対応</p>
              </div>
            </Button>
          </Link>

          <Link href="/bookkeeping">
            <Button 
              variant="outline" 
              className="h-16 justify-start w-full"
              data-testid="button-quick-bookkeeping"
            >
              <DollarSign className="w-6 h-6 mr-4" />
              <div className="text-left">
                <p className="font-medium">帳簿管理</p>
                <p className="text-xs text-muted-foreground">売上・経費の自動記録</p>
              </div>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}