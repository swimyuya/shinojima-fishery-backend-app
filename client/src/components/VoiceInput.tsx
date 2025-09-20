import { Mic, MicOff, Volume2, Fish, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShipmentForm {
  fishSpecies: string;
  quantity: string;
  destination: string;
  totalAmount: string;
  shipmentDate: string;
  notes: string;
}

export default function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ShipmentForm>({
    fishSpecies: '',
    quantity: '',
    destination: '篠島漁協',
    totalAmount: '',
    shipmentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const { toast } = useToast();

  const [recognition, setRecognition] = useState<any>(null);

  // 音声認識テキストから出荷情報を抽出
  const parseVoiceText = (text: string): ShipmentForm => {
    const parsed: ShipmentForm = {
      fishSpecies: '',
      quantity: '',
      destination: '篠島漁協',
      totalAmount: '',
      shipmentDate: new Date().toISOString().split('T')[0],
      notes: text
    };

    // 魚種を抽出（一般的な魚種名）
    const fishTypes = ['マダイ', '真鯛', 'ヒラメ', '平目', 'アジ', '鯵', 'サバ', '鯖', 'イワシ', '鰯', 'タチウオ', '太刀魚'];
    for (const fish of fishTypes) {
      if (text.includes(fish)) {
        parsed.fishSpecies = fish;
        break;
      }
    }

    // 数量を抽出（キロ、kg、匹など）
    const quantityMatch = text.match(/(\d+(?:\.\d+)?)\s*(キロ|kg|匹|尾|本)/);
    if (quantityMatch) {
      const value = quantityMatch[1];
      const unit = quantityMatch[2];
      // 単位を統一（重量系はkg、数量系はそのまま）
      const normalizedUnit = (unit === 'キロ') ? 'kg' : unit;
      parsed.quantity = `${value}${normalizedUnit}`;
    }

    // 価格を抽出（円）
    const priceMatch = text.match(/(\d+)\s*円/);
    if (priceMatch) {
      parsed.totalAmount = priceMatch[1];
    }

    return parsed;
  };

  const updateFormField = (field: keyof ShipmentForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const initSpeechRecognition = (): any => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('音声認識に対応していないブラウザです');
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    return recognition;
  };

  const handleStartRecording = async () => {
    console.log("音声録音開始");
    setIsRecording(true);
    setTranscribedText("");
    setIsProcessing(false);
    
    try {
      // マイクアクセス許可を確認
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const speechRecognition = initSpeechRecognition();
      setRecognition(speechRecognition);
      
      speechRecognition.onstart = () => {
        console.log("音声認識開始");
        setIsRecording(true);
      };
      
      speechRecognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          console.log("認識結果:", finalTranscript);
          setTranscribedText(finalTranscript);
          
          // 音声認識結果をフォームデータに変換
          const parsedData = parseVoiceText(finalTranscript);
          setFormData(parsedData);
          setShowForm(true);
          
          setIsRecording(false);
          setIsProcessing(false);
          speechRecognition.stop();
        }
      };
      
      speechRecognition.onerror = (error: any) => {
        console.error("音声認識エラー:", error);
        setIsRecording(false);
        setIsProcessing(false);
        
        let errorMessage = "音声認識に失敗しました。";
        if (error.error === 'not-allowed') {
          errorMessage = "マイクの使用が許可されていません。ブラウザの設定を確認してください。";
        } else if (error.error === 'no-speech') {
          errorMessage = "音声が検出されませんでした。もう一度お試しください。";
        } else if (error.error === 'network') {
          errorMessage = "ネットワークエラーが発生しました。";
        }
        
        alert(errorMessage);
      };
      
      speechRecognition.onend = () => {
        console.log("音声認識終了");
        setIsRecording(false);
        if (!transcribedText) {
          setIsProcessing(false);
        }
      };
      
      speechRecognition.start();
      
    } catch (error) {
      console.error("音声認識開始エラー:", error);
      setIsRecording(false);
      setIsProcessing(false);
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        alert("マイクの使用が許可されていません。ブラウザの設定を確認してください。");
      } else {
        alert("音声認識機能を使用できません。ブラウザが対応していない可能性があります。");
      }
    }
  };

  const handleStopRecording = () => {
    console.log("音声録音停止");
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
    setIsRecording(false);
    setIsProcessing(false);
  };

  const handleSaveRecord = async () => {
    console.log("出荷記録を保存:", formData);
    
    if (!formData.fishSpecies.trim()) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "魚種を入力してください。",
      });
      return;
    }
    
    try {
      // フォームデータを出荷記録として保存
      const shipmentData = {
        fishSpecies: formData.fishSpecies,
        quantity: formData.quantity || '未記録',
        totalAmount: formData.totalAmount || null,
        destination: formData.destination,
        shipmentDate: formData.shipmentDate,
        notes: `音声入力: ${transcribedText}${formData.notes ? ` / 追記: ${formData.notes}` : ''}`
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
          description: `出荷記録を保存しました。魚種: ${formData.fishSpecies}, 数量: ${formData.quantity}`,
        });
        
        // React Queryキャッシュを無効化してダッシュボードを更新
        const { queryClient } = await import("@/lib/queryClient");
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
        
        // フォームをリセット
        setTranscribedText("");
        setShowForm(false);
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
      console.error("保存エラー:", error);
      toast({
        variant: "destructive",
        title: "保存エラー",
        description: "記録の保存に失敗しました。もう一度お試しください。",
      });
    }
  };

  const handleRetry = () => {
    setTranscribedText("");
    setShowForm(false);
    setFormData({
      fishSpecies: '',
      quantity: '',
      destination: '篠島漁協',
      totalAmount: '',
      shipmentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handlePlayback = () => {
    console.log("音声再生");
    // todo: remove mock functionality
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            音声での出荷記録
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center relative">
              {isRecording ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse mx-auto mb-2">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm font-medium text-red-600">録音中...</p>
                </div>
              ) : isProcessing ? (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-muted-foreground">音声を処理中...</p>
                </div>
              ) : (
                <div className="text-center">
                  <MicOff className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">ボタンを押して音声記録を開始</p>
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">例: このように話してください</p>
              <p className="text-sm font-medium">「マダイ、10キロ、〇〇向け、単価800円」</p>
            </div>

            <div className="flex gap-3 justify-center">
              {!isRecording ? (
                <Button 
                  size="lg"
                  onClick={handleStartRecording}
                  disabled={isProcessing}
                  data-testid="button-start-recording"
                  className="flex-1 max-w-xs h-14 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  音声記録開始
                </Button>
              ) : (
                <Button 
                  size="lg"
                  onClick={handleStopRecording}
                  data-testid="button-stop-recording"
                  variant="destructive"
                  className="flex-1 max-w-xs h-14"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  録音停止
                </Button>
              )}
            </div>
          </div>

          {transcribedText && !showForm && (
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">認識結果</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handlePlayback}
                    data-testid="button-playback"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-lg font-medium mb-4" data-testid="text-transcribed">{transcribedText}</p>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleRetry}
                    data-testid="button-retry"
                    className="flex-1"
                  >
                    もう一度
                  </Button>
                  <Button 
                    onClick={handleSaveRecord}
                    data-testid="button-save-record"
                    className="flex-2"
                  >
                    記録を保存
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showForm && (
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                    <Fish className="w-5 h-5" />
                    出荷記録の入力・修正
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handlePlayback}
                    data-testid="button-playback-form"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-muted-foreground mb-1">音声認識結果:</p>
                  <p className="text-sm font-medium" data-testid="text-voice-result">{transcribedText}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="voice-fish-species" className="text-sm font-medium">魚種 *</Label>
                      <Input
                        id="voice-fish-species"
                        type="text"
                        placeholder="例: マダイ"
                        value={formData.fishSpecies}
                        onChange={(e) => updateFormField('fishSpecies', e.target.value)}
                        data-testid="input-voice-fish-species"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="voice-quantity" className="text-sm font-medium">数量</Label>
                      <Input
                        id="voice-quantity"
                        type="text"
                        placeholder="例: 10kg"
                        value={formData.quantity}
                        onChange={(e) => updateFormField('quantity', e.target.value)}
                        data-testid="input-voice-quantity"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="voice-destination" className="text-sm font-medium">出荷先</Label>
                      <Input
                        id="voice-destination"
                        type="text"
                        value={formData.destination}
                        onChange={(e) => updateFormField('destination', e.target.value)}
                        data-testid="input-voice-destination"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="voice-total-amount" className="text-sm font-medium">金額（円）</Label>
                      <Input
                        id="voice-total-amount"
                        type="number"
                        placeholder="例: 25000"
                        value={formData.totalAmount}
                        onChange={(e) => updateFormField('totalAmount', e.target.value)}
                        data-testid="input-voice-total-amount"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="voice-shipment-date" className="text-sm font-medium">出荷日</Label>
                      <Input
                        id="voice-shipment-date"
                        type="date"
                        value={formData.shipmentDate}
                        onChange={(e) => updateFormField('shipmentDate', e.target.value)}
                        data-testid="input-voice-shipment-date"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="voice-notes" className="text-sm font-medium">備考</Label>
                      <Input
                        id="voice-notes"
                        type="text"
                        placeholder="追加の備考があれば入力"
                        value={formData.notes}
                        onChange={(e) => updateFormField('notes', e.target.value)}
                        data-testid="input-voice-notes"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={handleRetry}
                      data-testid="button-retry-voice"
                      className="flex-1"
                    >
                      音声から再入力
                    </Button>
                    <Button 
                      onClick={handleSaveRecord}
                      data-testid="button-save-voice-record"
                      className="flex-1"
                      disabled={!formData.fishSpecies.trim()}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      記録を保存
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}