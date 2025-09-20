import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Using the javascript_gemini blueprint

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// レシート・領収書のOCR解析
export async function analyzeReceiptImage(imageBuffer: Buffer): Promise<{
  date: string;
  amount: string;
  vendor: string;
  category: string;
  confidence: number;
}> {
  try {
    const systemPrompt = `あなたはレシート・領収書の解析専門家です。
画像からレシートや領収書の情報を読み取り、以下の形式のJSONで返してください：
{
  "date": "YYYY-MM-DD",
  "amount": "数値のみ（カンマなし）",
  "vendor": "店舗名・業者名",
  "category": "燃料費/資材費/修理費/その他",
  "confidence": 0.0-1.0の信頼度
}

漁業関連の用語（燃料、網、ロープ、氷、修理等）に注意して分類してください。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            date: { type: "string" },
            amount: { type: "string" },
            vendor: { type: "string" },
            category: { type: "string" },
            confidence: { type: "number" }
          },
          required: ["date", "amount", "vendor", "category", "confidence"]
        }
      },
      contents: [
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: "image/jpeg"
          }
        },
        "このレシート・領収書の情報を解析してください"
      ]
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Receipt analysis error:", error);
    throw new Error(`レシート解析に失敗しました: ${error}`);
  }
}

// 魚の種類・重量の画像認識
export async function analyzeFishImage(imageBuffer: Buffer): Promise<{
  fishSpecies: string;
  quantity: string;
  confidence: number;
}> {
  try {
    const systemPrompt = `あなたは漁業専門の魚種識別エキスパートです。
画像から魚の種類と推定重量を分析し、以下の形式のJSONで返してください：
{
  "fishSpecies": "魚種名（日本語）",
  "quantity": "推定重量（例：10.5kg）",
  "confidence": 0.0-1.0の信頼度
}

日本の一般的な魚種（マダイ、スズキ、イサキ、アジ、サバ、イワシなど）を識別してください。
重量は魚の大きさから推定してください。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            fishSpecies: { type: "string" },
            quantity: { type: "string" },
            confidence: { type: "number" }
          },
          required: ["fishSpecies", "quantity", "confidence"]
        }
      },
      contents: [
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: "image/jpeg"
          }
        },
        "この魚の種類と推定重量を教えてください"
      ]
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Fish analysis error:", error);
    throw new Error(`魚種識別に失敗しました: ${error}`);
  }
}

// 音声の文字起こし（注：Gemini Flashは音声に対応していないため、将来的な実装のための準備）
export async function transcribeAudioToText(audioBuffer: Buffer): Promise<{
  text: string;
  confidence: number;
}> {
  try {
    // 注：現在のGemini APIは直接音声ファイルの処理に対応していないため、
    // 将来的にサポートされた際の実装準備として残しています
    // 実際の実装では、Web Speech API等のクライアントサイド技術を併用することを推奨
    
    throw new Error("音声処理は現在開発中です。ブラウザの音声認識機能をご利用ください。");
  } catch (error) {
    console.error("Audio transcription error:", error);
    throw new Error(`音声解析に失敗しました: ${error}`);
  }
}

// AI経営アドバイザー
export async function getBusinessAdvice(question: string, businessData: any): Promise<string> {
  try {
    const systemPrompt = `あなたは漁業経営の専門アドバイザーです。
篠島の漁業者に対して、経営データに基づいた実践的なアドバイスを日本語で提供してください。
以下の点に注意してください：
- 具体的で実行可能な提案をする
- 漁業業界の慣行を考慮する
- コスト削減と収益向上の両面から助言する
- 高齢の利用者にもわかりやすい言葉で説明する`;

    const prompt = `質問: ${question}

経営データ:
${JSON.stringify(businessData, null, 2)}

上記のデータを参考に、具体的なアドバイスをお願いします。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt
      },
      contents: prompt
    });

    return response.text || "申し訳ございませんが、アドバイスの生成に失敗しました。";
  } catch (error) {
    console.error("Business advice error:", error);
    throw new Error(`経営アドバイスの生成に失敗しました: ${error}`);
  }
}