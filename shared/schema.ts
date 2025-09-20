import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 基本ユーザー情報
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
});

// 出荷記録
export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  fishSpecies: text("fish_species").notNull(), // 魚種
  quantity: text("quantity").notNull(), // 数量（文字列で保存、例：「12.5kg」）
  destination: text("destination").notNull(), // 出荷先
  price: decimal("price", { precision: 10, scale: 2 }), // 単価
  totalAmount: text("total_amount"), // 合計金額（文字列で保存）
  notes: text("notes"), // 音声記録や追加メモ用
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // AI認識の信頼度
  shipmentDate: timestamp("shipment_date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// 経費記録
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(), // 燃料費、資材費等
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  receiptImageUrl: text("receipt_image_url"), // レシート画像URL
  expenseDate: timestamp("expense_date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// 在庫管理
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  itemName: text("item_name").notNull(), // 網、ロープ、燃料等
  currentStock: integer("current_stock").notNull(),
  minThreshold: integer("min_threshold").default(0), // 最低在庫数
  lastUpdated: timestamp("last_updated").default(sql`now()`),
});

// 書類保管
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  documentName: text("document_name").notNull(),
  documentType: text("document_type").notNull(), // 許可証、免許、保険証等
  imageUrl: text("image_url").notNull(),
  expiryDate: timestamp("expiry_date"), // 有効期限
  createdAt: timestamp("created_at").default(sql`now()`),
});

// 補助金・助成金情報
export const grants = pgTable("grants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eligibilityRequirements: text("eligibility_requirements").notNull(),
  applicationDeadline: timestamp("application_deadline"),
  grantAmount: decimal("grant_amount", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// スキーマ定義
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, lastUpdated: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertGrantSchema = createInsertSchema(grants).omit({ id: true, createdAt: true });

// 型定義
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventorySchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Grant = typeof grants.$inferSelect;
export type InsertGrant = z.infer<typeof insertGrantSchema>;