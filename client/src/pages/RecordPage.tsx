import { useState } from "react";
import { TrendingUp, TrendingDown, Camera, Mic, Edit, Receipt, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PhotoCapture from "@/components/PhotoCapture";
import VoiceInput from "@/components/VoiceInput";
import ExpenseScanner from "@/components/ExpenseScanner";
import ManualShipmentRecord from "@/components/ManualShipmentRecord";
import ManualExpenseRecord from "@/components/ManualExpenseRecord";

export default function RecordPage() {
  const [activeSection, setActiveSection] = useState<'revenue' | 'expense'>('revenue');
  const [revenueTab, setRevenueTab] = useState<'photo' | 'voice' | 'manual'>('photo');
  const [expenseTab, setExpenseTab] = useState<'receipt' | 'manual'>('receipt');

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-card-border p-4">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-xl font-bold text-center">
            売上・経費記録
          </h1>
          <p className="text-sm text-center text-muted-foreground mt-1">
            出荷記録と経費の入力・管理
          </p>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-4 space-y-6">
        {/* メインセクション切り替え */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={activeSection === 'revenue' ? 'default' : 'outline'}
                className="h-16 flex-col gap-2"
                onClick={() => setActiveSection('revenue')}
                data-testid="section-revenue"
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm">売上記録</span>
              </Button>
              
              <Button
                variant={activeSection === 'expense' ? 'default' : 'outline'}
                className="h-16 flex-col gap-2"
                onClick={() => setActiveSection('expense')}
                data-testid="section-expense"
              >
                <TrendingDown className="w-6 h-6" />
                <span className="text-sm">経費記録</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 売上記録セクション */}
        {activeSection === 'revenue' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">出荷記録の入力方法</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={revenueTab === 'photo' ? 'default' : 'outline'}
                    className="h-14 flex-col gap-1"
                    onClick={() => setRevenueTab('photo')}
                    data-testid="revenue-tab-photo"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-xs">写真記録</span>
                  </Button>
                  
                  <Button
                    variant={revenueTab === 'voice' ? 'default' : 'outline'}
                    className="h-14 flex-col gap-1"
                    onClick={() => setRevenueTab('voice')}
                    data-testid="revenue-tab-voice"
                  >
                    <Mic className="w-5 h-5" />
                    <span className="text-xs">音声記録</span>
                  </Button>

                  <Button
                    variant={revenueTab === 'manual' ? 'default' : 'outline'}
                    className="h-14 flex-col gap-1"
                    onClick={() => setRevenueTab('manual')}
                    data-testid="revenue-tab-manual"
                  >
                    <Edit className="w-5 h-5" />
                    <span className="text-xs">手動入力</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 売上記録コンテンツ */}
            {revenueTab === 'photo' && (
              <div data-testid="revenue-content-photo">
                <PhotoCapture />
              </div>
            )}
            
            {revenueTab === 'voice' && (
              <div data-testid="revenue-content-voice">
                <VoiceInput />
              </div>
            )}

            {revenueTab === 'manual' && (
              <div data-testid="revenue-content-manual">
                <ManualShipmentRecord />
              </div>
            )}
          </div>
        )}

        {/* 経費記録セクション */}
        {activeSection === 'expense' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">経費記録の入力方法</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={expenseTab === 'receipt' ? 'default' : 'outline'}
                    className="h-14 flex-col gap-1"
                    onClick={() => setExpenseTab('receipt')}
                    data-testid="expense-tab-receipt"
                  >
                    <Receipt className="w-5 h-5" />
                    <span className="text-xs">レシート読み取り</span>
                  </Button>

                  <Button
                    variant={expenseTab === 'manual' ? 'default' : 'outline'}
                    className="h-14 flex-col gap-1"
                    onClick={() => setExpenseTab('manual')}
                    data-testid="expense-tab-manual"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs">手動入力</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 経費記録コンテンツ */}
            {expenseTab === 'receipt' && (
              <div data-testid="expense-content-receipt">
                <ExpenseScanner />
              </div>
            )}

            {expenseTab === 'manual' && (
              <div data-testid="expense-content-manual">
                <ManualExpenseRecord />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}