import { Camera, Upload, RotateCcw, Fish, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface RecognitionResult {
  fishSpecies: string;
  quantity: string;
  confidence: number;
}

export default function PhotoCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [destination, setDestination] = useState('篠島漁協');
  const [totalAmount, setTotalAmount] = useState('');
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const capturePhoto = async (stream: MediaStream): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      video.onloadedmetadata = () => {
        // 短い遅延を入れてビデオが安定するのを待つ
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(resolve, 'image/jpeg', 0.8);
          } else {
            resolve(null);
          }
          
          // ビデオ要素をクリーンアップ
          video.srcObject = null;
        }, 500);
      };
    });
  };

  const handleCapture = async () => {
    console.log("カメラ撮影開始");
    setIsCapturing(true);
    
    let stream: MediaStream | null = null;
    
    try {
      // カメラへのアクセス許可を要求
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // 写真を撮影
      const photoBlob = await capturePhoto(stream);
      
      if (!photoBlob) {
        throw new Error('写真の撮影に失敗しました');
      }
      
      const imageUrl = URL.createObjectURL(photoBlob);
      setPreviewImage(imageUrl);
      
      // Gemini APIで魚種解析
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('image', photoBlob, 'photo.jpg');
      
      const response = await fetch('/api/analyze-fish', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const analysisResult = await response.json();
        setResult({
          fishSpecies: analysisResult.fishSpecies,
          quantity: analysisResult.quantity,
          confidence: analysisResult.confidence
        });
      } else {
        const error = await response.text();
        throw new Error(`画像解析に失敗しました: ${error}`);
      }
      
    } catch (error) {
      console.error("写真撮影エラー:", error);
      let errorMessage = "写真撮影に失敗しました。";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "カメラの使用が許可されていません。ブラウザの設定を確認してください。";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "カメラが見つかりません。";
        } else if (error.message.includes('解析')) {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "エラー",
        description: errorMessage + " ファイルアップロードをお試しください。",
      });
    } finally {
      // カメラストリームを確実に停止
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`カメラトラック停止: ${track.kind}`);
        });
      }
      setIsCapturing(false);
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    console.log("再撮影");
    setResult(null);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setIsCapturing(false);
    // フォームフィールドもリセット
    setDestination('篠島漁協');
    setTotalAmount('');
    setShipmentDate(new Date().toISOString().split('T')[0]);
  };

  const handleTestImage = async () => {
    console.log("テスト画像で解析開始");
    
    // テスト用の魚画像（base64エンコード済み）- 小さなマダイのサンプル
    const base64Data = `/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDAREAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAABgIDBAUHAAj/xAA0EAABAgQFAgQFAgcAAAAAAAABAgMABAURBhIhMQcTQVEiYXGBFDKRobEzcsHR8PEVJEKCkv/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwClwrB0pEzNB6VFQUpIJ6b7m+1yd4r1rEKX8Vm2CjYH3Ybu/vdqP1y6KQpTTa3KfQm+r2XPmBq8e0nNq3xjHDhVTdCiOsLYpLYyCUXFgbXGhOoOhHBFg8Z4mxJiKjKCZxCcUJ5xKqPwAdBNnhEi9rgBJW+lhyMCZTQ3cDj+8qGG2w4Cg3H9pcwpqYm6VNyb6DKV8a7oUpVmQSJFgfKJEq8sqQ5KfFOLU2mIhPaB1C23H3CQa8rF5HgxLJ2xLguvTSRiIVANq8qGsN8f8ANFbOCz4zOLTxnGAQRbr2nzFt3cF8QYEoUsKv6HS1EJIm3CZY3g8n5KFDMR5gdPfCBIxwJN0k8zZN7XhJV5qTe9+4ueLQ0vwgB8N8U45m5KXekmFJm0ICgdxff3gLiPxXx9IqGWal/FSbf4lNZxD/2Q==`;
    
    try {
      // base64をBlobに変換（手動デコード）
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const testBlob = new Blob([byteArray], { type: 'image/jpeg' });
      
      const imageUrl = URL.createObjectURL(testBlob);
      setPreviewImage(imageUrl);
      
      // AI分析開始
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('image', testBlob, 'test-fish.jpg');
      
      const analysisResponse = await fetch('/api/analyze-fish', {
        method: 'POST',
        body: formData
      });
      
      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();
        setResult({
          fishSpecies: analysisResult.fishSpecies,
          quantity: analysisResult.quantity,
          confidence: analysisResult.confidence
        });
        
        toast({
          title: "テスト解析完了",
          description: "サンプル画像での魚種解析が完了しました。",
        });
      } else {
        const error = await analysisResponse.text();
        throw new Error(`テスト画像解析に失敗しました: ${error}`);
      }
    } catch (error) {
      console.error("テスト画像解析エラー:", error);
      toast({
        variant: "destructive",
        title: "テスト解析エラー",
        description: error instanceof Error ? error.message : "テスト画像の解析に失敗しました。",
      });
    } finally {
      setIsAnalyzing(false);
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

    try {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      
      // AI分析開始
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/analyze-fish', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const analysisResult = await response.json();
        setResult({
          fishSpecies: analysisResult.fishSpecies,
          quantity: analysisResult.quantity,
          confidence: analysisResult.confidence
        });
      } else {
        const error = await response.text();
        throw new Error(`画像解析に失敗しました: ${error}`);
      }
    } catch (error) {
      console.error("ファイル解析エラー:", error);
      toast({
        variant: "destructive",
        title: "解析エラー",
        description: error instanceof Error ? error.message : "画像の解析に失敗しました。",
      });
    } finally {
      setIsAnalyzing(false);
      // ファイル入力をリセット
      event.target.value = '';
    }
  };

  const handleConfirm = async () => {
    console.log("認識結果を確定:", result);
    
    if (!result) return;

    // 基本的なバリデーション
    if (!destination.trim()) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "出荷先を入力してください。",
      });
      return;
    }

    const amountNum = totalAmount ? parseFloat(totalAmount) : null;
    if (totalAmount && (isNaN(amountNum!) || amountNum! < 0)) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "金額は正の数値を入力してください。",
      });
      return;
    }
    
    try {
      // 出荷記録として保存
      const shipmentData = {
        fishSpecies: result.fishSpecies,
        quantity: result.quantity,
        totalAmount: amountNum?.toString() || null,
        destination: destination.trim(),
        shipmentDate: shipmentDate,
        confidence: result.confidence
      };
      
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentData)
      });
      
      if (response.ok) {
        const savedShipment = await response.json();
        console.log("出荷記録保存成功:", savedShipment);
        
        toast({
          title: "保存完了",
          description: `出荷記録を保存しました。魚種: ${result.fishSpecies}, 数量: ${result.quantity}${totalAmount ? `, 金額: ${totalAmount}円` : ''}`,
        });
        
        // React Queryキャッシュを無効化してダッシュボードを更新
        const { queryClient } = await import("@/lib/queryClient");
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
        
        // オブジェクトURLをクリーンアップ
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
        }
        
        setResult(null);
        setPreviewImage(null);
        // フォームもリセット
        setDestination('篠島漁協');
        setTotalAmount('');
        setShipmentDate(new Date().toISOString().split('T')[0]);
      } else {
        const error = await response.text();
        throw new Error(`保存に失敗しました: ${error}`);
      }
    } catch (error) {
      console.error("保存エラー:", error);
      toast({
        variant: "destructive",
        title: "保存エラー",
        description: "記録の保存に失敗しました。もう一度お試しください。",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            魚種・数量の写真認識
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!previewImage ? (
            <div className="text-center space-y-4">
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                {isCapturing ? (
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-muted-foreground">AIが画像を解析中...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">水揚げした魚を撮影してください</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  size="lg"
                  onClick={handleCapture}
                  disabled={isCapturing || isAnalyzing}
                  data-testid="button-capture-photo"
                  className="flex-1 max-w-xs h-14"
                >
                  {isCapturing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      撮影中...
                    </div>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      写真を撮る
                    </>
                  )}
                </Button>
                <Button 
                  size="lg"
                  className="flex-1 max-w-xs h-14"
                  data-testid="button-upload-photo"
                  disabled={isAnalyzing}
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  アップロード
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="flex-1 max-w-xs h-14"
                  data-testid="button-test-image"
                  disabled={isAnalyzing}
                  onClick={handleTestImage}
                >
                  <TestTube className="w-5 h-5 mr-2" />
                  テスト画像
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="撮影した魚"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                    <div className="bg-white dark:bg-black/90 backdrop-blur-sm rounded-lg p-6 text-center max-w-xs">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Fish className="w-6 h-6 text-primary" />
                        <h4 className="font-semibold text-lg text-foreground dark:text-white">AI分析中</h4>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-gray-300">
                        魚種と重量を推定しています...
                      </p>
                    </div>
                  </div>
                )}
                {result && !isAnalyzing && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-sm">
                      信頼度: {Math.round(result.confidence * 100)}%
                    </Badge>
                  </div>
                )}
              </div>

              {isAnalyzing ? (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <h4 className="font-semibold">Gemini AIで分析中...</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      しばらくお待ちください（通常10-30秒）
                    </p>
                  </CardContent>
                </Card>
              ) : result && (
                <>
                  <Card className="bg-primary/5">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">✅ 認識結果</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">魚種</p>
                          <p className="font-semibold text-lg" data-testid="text-fish-species">{result.fishSpecies}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">推定重量</p>
                          <p className="font-semibold text-lg" data-testid="text-quantity">{result.quantity}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">出荷詳細情報</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="destination">出荷先</Label>
                            <Input
                              id="destination"
                              type="text"
                              value={destination}
                              onChange={(e) => setDestination(e.target.value)}
                              data-testid="input-destination"
                            />
                          </div>
                          <div>
                            <Label htmlFor="total-amount">金額（円）</Label>
                            <Input
                              id="total-amount"
                              type="number"
                              placeholder="例: 25000"
                              value={totalAmount}
                              onChange={(e) => setTotalAmount(e.target.value)}
                              data-testid="input-total-amount"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="shipment-date">出荷日</Label>
                          <Input
                            id="shipment-date"
                            type="date"
                            value={shipmentDate}
                            onChange={(e) => setShipmentDate(e.target.value)}
                            data-testid="input-shipment-date"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleRetake}
                  data-testid="button-retake"
                  className="flex-1"
                  disabled={isAnalyzing}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  再撮影
                </Button>
                <Button 
                  onClick={handleConfirm}
                  data-testid="button-confirm"
                  className="flex-1"
                  disabled={!result || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      分析中...
                    </div>
                  ) : (
                    "記録を保存"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}