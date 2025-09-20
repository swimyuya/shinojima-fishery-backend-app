import { Camera, Upload, FileText, Check, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import receiptImageUrl from "@assets/レシート_1758394013347.jpg";

interface OCRResult {
  date: string;
  amount: string;
  vendor: string;
  category: string;
  confidence: number;
}

export default function ExpenseScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableResult, setEditableResult] = useState<OCRResult | null>(null);
  const { toast } = useToast();

  const captureReceipt = async (stream: MediaStream): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      video.onloadedmetadata = () => {
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(resolve, 'image/jpeg', 0.9); // 高品質でOCR精度向上
          } else {
            resolve(null);
          }
          
          video.srcObject = null;
        }, 500);
      };
    });
  };

  const handleScanReceipt = async () => {
    console.log("レシート撮影・スキャン開始");
    setIsScanning(true);
    
    let stream: MediaStream | null = null;
    
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      const receiptBlob = await captureReceipt(stream);
      
      if (!receiptBlob) {
        throw new Error('レシートの撮影に失敗しました');
      }
      
      const imageUrl = URL.createObjectURL(receiptBlob);
      setReceiptImage(imageUrl);
      
      // Gemini APIでOCR解析
      const formData = new FormData();
      formData.append('image', receiptBlob, 'receipt.jpg');
      
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const ocrResult = await response.json();
        const resultData = {
          date: ocrResult.date,
          amount: ocrResult.amount,
          vendor: ocrResult.vendor,
          category: ocrResult.category,
          confidence: ocrResult.confidence
        };
        setResult(resultData);
        setEditableResult(resultData);
        setIsEditing(false);
      } else {
        const error = await response.text();
        throw new Error(`OCR解析に失敗しました: ${error}`);
      }
      
    } catch (error) {
      console.error("レシートスキャンエラー:", error);
      let errorMessage = "レシートスキャンに失敗しました。";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "カメラの使用が許可されていません。ブラウザの設定を確認してください。";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "カメラが見つかりません。";
        } else if (error.message.includes('解析')) {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage + " ファイルアップロードをお試しください。");
    } finally {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`カメラトラック停止: ${track.kind}`);
        });
      }
      setIsScanning(false);
    }
  };

  const handleTestImage = async () => {
    console.log("テストレシートで解析開始");
    
    try {
      setIsScanning(true);
      
      // 添付されたレシート画像を使用
      const response = await fetch(receiptImageUrl);
      const testBlob = await response.blob();
      
      const imageUrl = URL.createObjectURL(testBlob);
      setReceiptImage(imageUrl);
      
      // AI OCR解析開始
      const formData = new FormData();
      formData.append('image', testBlob, 'test-receipt.jpg');
      
      const ocrResponse = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData
      });
      
      if (ocrResponse.ok) {
        const ocrResult = await ocrResponse.json();
        const resultData = {
          date: ocrResult.date,
          amount: ocrResult.amount,
          vendor: ocrResult.vendor,
          category: ocrResult.category,
          confidence: ocrResult.confidence
        };
        setResult(resultData);
        setEditableResult(resultData);
        setIsEditing(false);
        
        toast({
          title: "テスト解析完了",
          description: "サンプルレシートでのOCR解析が完了しました。",
        });
      } else {
        const error = await ocrResponse.text();
        throw new Error(`テストOCR解析に失敗しました: ${error}`);
      }
    } catch (error) {
      console.error("テストレシート解析エラー:", error);
      toast({
        variant: "destructive",
        title: "テスト解析エラー",
        description: error instanceof Error ? error.message : "テストレシートの解析に失敗しました。",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（10MB以下）
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。10MB以下の画像をお選びください。');
      return;
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルをお選びください。');
      return;
    }

    setIsScanning(true);
    
    try {
      const imageUrl = URL.createObjectURL(file);
      setReceiptImage(imageUrl);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const ocrResult = await response.json();
        const resultData = {
          date: ocrResult.date,
          amount: ocrResult.amount,
          vendor: ocrResult.vendor,
          category: ocrResult.category,
          confidence: ocrResult.confidence
        };
        setResult(resultData);
        setEditableResult(resultData);
        setIsEditing(false);
      } else {
        const error = await response.text();
        throw new Error(`OCR解析に失敗しました: ${error}`);
      }
    } catch (error) {
      console.error("ファイル解析エラー:", error);
      alert(error instanceof Error ? error.message : "画像の解析に失敗しました。");
    } finally {
      setIsScanning(false);
      // ファイル入力をリセット
      event.target.value = '';
    }
  };

  const handleEditResult = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableResult(result); // 元の結果に戻す
  };

  const handleSaveEdits = () => {
    if (editableResult) {
      setResult(editableResult);
      setIsEditing(false);
    }
  };

  const updateEditableField = (field: keyof OCRResult, value: string) => {
    if (editableResult) {
      setEditableResult({
        ...editableResult,
        [field]: value
      });
    }
  };

  const handleSaveExpense = async () => {
    // 編集モード中であれば編集内容を使用、そうでなければ通常の結果を使用
    const currentResult = isEditing && editableResult ? editableResult : result;
    console.log("経費記録を保存:", currentResult);
    
    if (!currentResult) return;
    
    // 編集モード中であれば自動的に編集内容を確定
    if (isEditing && editableResult) {
      setResult(editableResult);
      setIsEditing(false);
    }
    
    try {
      // 経費記録として保存
      const expenseData = {
        category: currentResult.category,
        amount: currentResult.amount,
        vendor: currentResult.vendor,
        date: currentResult.date,
        confidence: currentResult.confidence
      };
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      
      if (response.ok) {
        const savedExpense = await response.json();
        console.log("経費記録保存成功:", savedExpense);
        alert(`📄 経費記録を保存しました！\n\n業者: ${currentResult.vendor}\n金額: ${currentResult.amount}円\nカテゴリ: ${currentResult.category}`);
        
        // React Queryキャッシュを無効化してダッシュボードを更新
        const { queryClient } = await import("@/lib/queryClient");
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
        
        setResult(null);
        setEditableResult(null);
        setReceiptImage(null);
        setIsEditing(false);
      } else {
        const error = await response.text();
        throw new Error(`保存に失敗しました: ${error}`);
      }
    } catch (error) {
      console.error("保存エラー:", error);
      alert("❌ 経費記録の保存に失敗しました。もう一度お試しください。");
    }
  };

  const handleRetry = () => {
    console.log("再スキャン");
    setResult(null);
    setEditableResult(null);
    setReceiptImage(null);
    setIsScanning(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            レシート・領収書の自動読取り
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!receiptImage ? (
            <div className="text-center space-y-4">
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                {isScanning ? (
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-muted-foreground">OCRでデータを読み取り中...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">レシートや領収書を撮影してください</p>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  燃料代、資材費、修理費などの領収書を撮影すると、<br />
                  自動で経費として記録されます
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  size="lg"
                  onClick={handleScanReceipt}
                  disabled={isScanning}
                  data-testid="button-scan-receipt"
                  className="flex-1 max-w-xs h-14"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {isScanning ? "読取中..." : "レシート撮影"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 max-w-xs h-14"
                  data-testid="button-upload-receipt"
                  disabled={isScanning}
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  アップロード
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="flex-1 max-w-xs h-14"
                  data-testid="button-test-receipt"
                  disabled={isScanning}
                  onClick={handleTestImage}
                >
                  <TestTube className="w-5 h-5 mr-2" />
                  テスト画像
                </Button>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <img 
                    src={receiptImage} 
                    alt="スキャンしたレシート"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
                
                {result && (
                  <div className="flex-1">
                    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-green-800 dark:text-green-200">
                            {isEditing ? '読取り結果を修正' : '読取り結果'}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              精度: {Math.round(result.confidence * 100)}%
                            </Badge>
                            {!isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleEditResult}
                                data-testid="button-edit-result"
                                className="h-6 w-6 p-0"
                              >
                                <FileText className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {isEditing && editableResult ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="edit-date" className="text-xs text-green-600 dark:text-green-400">日付</Label>
                              <Input
                                id="edit-date"
                                type="date"
                                value={editableResult.date}
                                onChange={(e) => updateEditableField('date', e.target.value)}
                                data-testid="input-edit-date"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-amount" className="text-xs text-green-600 dark:text-green-400">金額（円）</Label>
                              <Input
                                id="edit-amount"
                                type="number"
                                value={editableResult.amount}
                                onChange={(e) => updateEditableField('amount', e.target.value)}
                                data-testid="input-edit-amount"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-vendor" className="text-xs text-green-600 dark:text-green-400">取引先</Label>
                              <Input
                                id="edit-vendor"
                                type="text"
                                value={editableResult.vendor}
                                onChange={(e) => updateEditableField('vendor', e.target.value)}
                                data-testid="input-edit-vendor"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-category" className="text-xs text-green-600 dark:text-green-400">分類</Label>
                              <Input
                                id="edit-category"
                                type="text"
                                value={editableResult.category}
                                onChange={(e) => updateEditableField('category', e.target.value)}
                                data-testid="input-edit-category"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                data-testid="button-cancel-edit"
                                className="flex-1"
                              >
                                キャンセル
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveEdits}
                                data-testid="button-save-edits"
                                className="flex-1"
                              >
                                保存
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-green-600 dark:text-green-400">日付</p>
                              <p className="font-medium" data-testid="text-expense-date">{result.date}</p>
                            </div>
                            <div>
                              <p className="text-xs text-green-600 dark:text-green-400">金額</p>
                              <p className="font-medium text-lg" data-testid="text-expense-amount">¥{result.amount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-green-600 dark:text-green-400">取引先</p>
                              <p className="font-medium text-sm" data-testid="text-expense-vendor">{result.vendor}</p>
                            </div>
                            <div>
                              <p className="text-xs text-green-600 dark:text-green-400">分類</p>
                              <Badge className="text-xs">{result.category}</Badge>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
                  data-testid="button-retry-scan"
                  className="flex-1"
                >
                  再スキャン
                </Button>
                <Button 
                  onClick={handleSaveExpense}
                  data-testid="button-save-expense"
                  className="flex-2"
                  disabled={!result}
                >
                  <Check className="w-4 h-4 mr-2" />
                  経費を記録
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}