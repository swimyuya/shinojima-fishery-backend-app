import { User, Settings, HelpCircle, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [voiceAssistant, setVoiceAssistant] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-card-border p-4">
        <div className="max-w-screen-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">設定</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-4 space-y-6">
        {/* プロフィール設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              プロフィール
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">山田太郎</p>
                <p className="text-sm text-muted-foreground">篠島漁業協同組合</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-edit-profile">
                編集
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* アプリ設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              アプリケーション設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">通知</p>
                <p className="text-sm text-muted-foreground">補助金情報やメンテナンス通知</p>
              </div>
              <Switch 
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">自動バックアップ</p>
                <p className="text-sm text-muted-foreground">データの自動保存機能</p>
              </div>
              <Switch 
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
                data-testid="switch-auto-backup"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">音声アシスタント</p>
                <p className="text-sm text-muted-foreground">AIとの音声会話機能</p>
              </div>
              <Switch 
                checked={voiceAssistant}
                onCheckedChange={setVoiceAssistant}
                data-testid="switch-voice-assistant"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">表示テーマ</p>
                <p className="text-sm text-muted-foreground">明るい/暗いテーマの切り替え</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* サポート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              サポート
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-help"
            >
              使い方ガイド
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-contact"
            >
              お問い合わせ
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-version"
            >
              バージョン情報
            </Button>
          </CardContent>
        </Card>

        {/* データ管理 */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              data-testid="button-export-data"
            >
              データ出力 (CSV)
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              data-testid="button-import-data"
            >
              データ取り込み
            </Button>
            <Button 
              variant="destructive" 
              className="w-full"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}