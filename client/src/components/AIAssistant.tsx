import { MessageCircle, Mic, MicOff, Volume2, Brain, Database, Waves, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AIAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'transcribing' | 'data' | 'ai' | null>(null);
  const [currentRecognition, setCurrentRecognition] = useState<any>(null);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'こんにちは！経営に関するご質問があれば何でもお聞きください。「先月の売上を教えて」「一番経費がかかっているのは何？」など、お気軽にお話しください。',
      timestamp: '09:00'
    }
  ]);

  const handleStartListening = async () => {
    console.log("AI音声会話開始");
    setIsListening(true);
    
    try {
      // Web Speech APIを使用
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('音声認識に対応していないブラウザです');
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = false;
      setCurrentRecognition(recognition);
      
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setIsProcessing(true);
        setProcessingStage('transcribing');
        
        // ユーザーメッセージを追加
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: transcript,
          timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        try {
          // 段階1: データ取得
          setProcessingStage('data');
          await new Promise(resolve => setTimeout(resolve, 500)); // UIでの変化を見やすくするための小さな遅延
          
          const dashboardResponse = await fetch('/api/dashboard');
          const businessData = dashboardResponse.ok ? await dashboardResponse.json() : {};
          
          // 段階2: AI処理
          setProcessingStage('ai');
          const adviceResponse = await fetch('/api/business-advice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              question: transcript, 
              businessData 
            })
          });
          
          if (adviceResponse.ok) {
            const { advice } = await adviceResponse.json();
            
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'assistant',
              content: advice,
              timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
            };
            
            setMessages(prev => [...prev, aiMessage]);
          } else {
            throw new Error('AIアドバイスの取得に失敗しました');
          }
        } catch (error) {
          console.error("AI応答エラー:", error);
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: 'すみません、応答の生成に失敗しました。もう一度お試しください。',
            timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, errorMessage]);
        }
        
        setIsProcessing(false);
        setProcessingStage(null);
      };
      
      recognition.onerror = (error: any) => {
        console.error("音声認識エラー:", error);
        setIsListening(false);
        setIsProcessing(false);
        setProcessingStage(null);
      };
      
      recognition.start();
    } catch (error) {
      console.error("音声認識開始エラー:", error);
      alert("音声認識機能に対応していないブラウザです。");
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    console.log("音声会話停止");
    if (currentRecognition) {
      currentRecognition.stop();
    }
    setIsListening(false);
    setIsProcessing(true);
    setProcessingStage('transcribing');
    
    // Add processing message
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingStage(null);
    }, 1500);
  };

  const handlePlayMessage = (messageId: string) => {
    console.log("メッセージ音声再生:", messageId);
    // todo: remove mock functionality
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputText = textInput.trim();
    if (!inputText || isProcessing) return;

    console.log("テキストで質問送信:", inputText);
    
    // テキスト入力をクリア
    setTextInput('');
    setIsProcessing(true);
    setProcessingStage('data');

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // 段階1: データ取得
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dashboardResponse = await fetch('/api/dashboard');
      const businessData = dashboardResponse.ok ? await dashboardResponse.json() : {};

      // 段階2: AI処理
      setProcessingStage('ai');
      const adviceResponse = await fetch('/api/business-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: inputText, 
          businessData 
        })
      });

      if (adviceResponse.ok) {
        const { advice } = await adviceResponse.json();
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: advice,
          timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('AIアドバイスの取得に失敗しました');
      }
    } catch (error) {
      console.error("テキスト質問エラー:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'すみません、応答の生成に失敗しました。もう一度お試しください。',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsProcessing(false);
    setProcessingStage(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            AIアシスタント
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* チャット履歴 */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-4' 
                    : 'bg-muted mr-4'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">{message.content}</p>
                    {message.type === 'assistant' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() => handlePlayMessage(message.id)}
                        data-testid={`button-play-${message.id}`}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg mr-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    {processingStage === 'transcribing' && (
                      <>
                        <Waves className="w-5 h-5 text-blue-600 animate-pulse" />
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">音声を解析中</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">あなたの声をテキストに変換しています...</p>
                        </div>
                      </>
                    )}
                    {processingStage === 'data' && (
                      <>
                        <Database className="w-5 h-5 text-green-600 animate-pulse" />
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">データ取得中</p>
                          <p className="text-xs text-green-600 dark:text-green-400">経営データを収集しています...</p>
                        </div>
                      </>
                    )}
                    {processingStage === 'ai' && (
                      <>
                        <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-purple-800 dark:text-purple-200">AI分析中</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">最適な経営アドバイスを生成しています...</p>
                        </div>
                      </>
                    )}
                    {!processingStage && (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        <p className="text-sm">考え中...</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 音声入力コントロール */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-center gap-4">
              {isListening && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-full">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-red-500 animate-pulse rounded-full" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-4 bg-red-500 animate-pulse rounded-full" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-1 h-4 bg-red-500 animate-pulse rounded-full" style={{ animationDelay: '400ms' }}></div>
                  </div>
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    音声認識中
                  </span>
                </div>
              )}
              
              <Button
                size="lg"
                onClick={isListening ? handleStopListening : handleStartListening}
                disabled={isProcessing}
                data-testid="button-voice-assistant"
                className={`h-14 ${isListening ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    会話終了
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    音声で質問
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                例: 「今月の利益はどれくらい？」「燃料費を削減するには？」
              </p>
            </div>
          </div>

          {/* テキスト入力 */}
          <div className="border-t pt-4">
            <form onSubmit={handleTextSubmit} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="テキストで質問を入力してください..."
                  disabled={isProcessing || isListening}
                  data-testid="input-ai-question"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isProcessing || isListening || !textInput.trim()}
                  data-testid="button-send-text"
                  size="default"
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  音声またはテキストで質問できます
                </p>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}