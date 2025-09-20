import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { analyzeReceiptImage, analyzeFishImage, getBusinessAdvice } from "./gemini-service";
import { createRepository, getAuthenticatedUser } from "./github-service";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // 魚種・数量の画像解析API
  app.post("/api/analyze-fish", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "画像ファイルが必要です" });
      }

      const result = await analyzeFishImage(req.file.buffer);
      res.json(result);
    } catch (error) {
      console.error("Fish analysis error:", error);
      res.status(500).json({ error: "魚種解析に失敗しました" });
    }
  });

  // レシート・領収書のOCR解析API
  app.post("/api/analyze-receipt", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "画像ファイルが必要です" });
      }

      const result = await analyzeReceiptImage(req.file.buffer);
      res.json(result);
    } catch (error) {
      console.error("Receipt analysis error:", error);
      res.status(500).json({ error: "レシート解析に失敗しました" });
    }
  });

  // AI経営アドバイザーAPI
  app.post("/api/business-advice", async (req, res) => {
    try {
      const { question, businessData } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: "質問が必要です" });
      }

      const advice = await getBusinessAdvice(question, businessData || {});
      res.json({ advice });
    } catch (error) {
      console.error("Business advice error:", error);
      res.status(500).json({ error: "アドバイス生成に失敗しました" });
    }
  });

  // 出荷記録の保存API
  app.post("/api/shipments", async (req, res) => {
    try {
      const shipmentData = req.body;
      
      // デフォルトユーザーIDを使用（実際のアプリではセッションから取得）
      const userId = 'default-user';
      
      const newShipment = await storage.createShipment({
        userId,
        fishSpecies: shipmentData.fishSpecies || 'その他',
        quantity: shipmentData.quantity || '0kg',
        destination: shipmentData.destination || '篠島漁協',
        price: shipmentData.price || null,
        totalAmount: shipmentData.totalAmount || null,
        notes: shipmentData.notes || null,
        confidence: shipmentData.confidence || null,
        shipmentDate: new Date()
      });
      
      res.json({ success: true, message: "出荷記録を保存しました", data: newShipment });
    } catch (error) {
      console.error("Shipment save error:", error);
      res.status(500).json({ error: "出荷記録の保存に失敗しました" });
    }
  });

  // 経費記録の保存API
  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = req.body;
      
      // デフォルトユーザーIDを使用
      const userId = 'default-user';
      
      const newExpense = await storage.createExpense({
        userId,
        category: expenseData.category || 'その他',
        amount: expenseData.amount || '0',
        description: expenseData.vendor || '',
        receiptImageUrl: null, // 画像保存は別途実装
        expenseDate: new Date(expenseData.date || new Date())
      });
      
      res.json({ success: true, message: "経費記録を保存しました", data: newExpense });
    } catch (error) {
      console.error("Expense save error:", error);
      res.status(500).json({ error: "経費記録の保存に失敗しました" });
    }
  });

  // 出荷記録の取得API
  app.get("/api/shipments", async (req, res) => {
    try {
      const userId = 'default-user';
      const shipments = await storage.getShipments(userId);
      res.json(shipments);
    } catch (error) {
      console.error("Shipments fetch error:", error);
      res.status(500).json({ error: "出荷記録の取得に失敗しました" });
    }
  });

  // 経費記録の取得API
  app.get("/api/expenses", async (req, res) => {
    try {
      const userId = 'default-user';
      const expenses = await storage.getExpenses(userId);
      res.json(expenses);
    } catch (error) {
      console.error("Expenses fetch error:", error);
      res.status(500).json({ error: "経費記録の取得に失敗しました" });
    }
  });

  // ダッシュボードデータ取得API
  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = 'default-user';
      const shipments = await storage.getShipments(userId);
      const expenses = await storage.getExpenses(userId);
      
      // 今月のデータを計算
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const thisMonthShipments = shipments.filter(s => {
        const shipmentDate = new Date(s.shipmentDate);
        return shipmentDate.getMonth() === currentMonth && shipmentDate.getFullYear() === currentYear;
      });
      
      const thisMonthExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.expenseDate);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });
      
      // 売上・経費・利益を計算
      const totalRevenue = thisMonthShipments.reduce((sum, s) => {
        const amount = parseFloat(s.totalAmount || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      const totalExpenses = thisMonthExpenses.reduce((sum, e) => {
        const amount = parseFloat(e.amount || '0');
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      const profit = totalRevenue - totalExpenses;
      
      // 最近の出荷記録（最新5件）
      const recentShipments = shipments
        .sort((a, b) => new Date(b.shipmentDate).getTime() - new Date(a.shipmentDate).getTime())
        .slice(0, 5);
      
      const dashboardData = {
        monthlyStats: {
          revenue: Math.round(totalRevenue),
          expenses: Math.round(totalExpenses),
          profit: Math.round(profit),
          shipments: thisMonthShipments.length,
          revenueChange: 0, // 前月比計算は複雑なのでひとまず0
          expenseChange: 0,
        },
        recentShipments
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard data error:", error);
      res.status(500).json({ error: "ダッシュボードデータの取得に失敗しました" });
    }
  });

  // GitHubユーザー情報取得API
  app.get("/api/github/user", async (req, res) => {
    try {
      const result = await getAuthenticatedUser();
      if (result.success) {
        res.json(result.user);
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      console.error("GitHub user fetch error:", error);
      res.status(500).json({ error: "GitHubユーザー情報の取得に失敗しました" });
    }
  });

  // GitHubリポジトリ作成API
  app.post("/api/github/create-repo", async (req, res) => {
    try {
      const { name, description, private: isPrivate = false } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "リポジトリ名が必要です" });
      }

      const result = await createRepository(name, description, isPrivate);
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      console.error("GitHub repository creation error:", error);
      res.status(500).json({ error: "GitHubリポジトリの作成に失敗しました" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}