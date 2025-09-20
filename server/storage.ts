import { 
  type User, type InsertUser,
  type Shipment, type InsertShipment,
  type Expense, type InsertExpense,
  type InventoryItem, type InsertInventoryItem,
  type Document, type InsertDocument
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByName(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Shipment management
  getShipments(userId: string): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  getShipmentById(id: string): Promise<Shipment | undefined>;
  
  // Expense management
  getExpenses(userId: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenseById(id: string): Promise<Expense | undefined>;
  
  // Inventory management
  getInventory(userId: string): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem>;
  
  // Document management
  getDocuments(userId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private shipments: Map<string, Shipment>;
  private expenses: Map<string, Expense>;
  private inventory: Map<string, InventoryItem>;
  private documents: Map<string, Document>;

  constructor() {
    this.users = new Map();
    this.shipments = new Map();
    this.expenses = new Map();
    this.inventory = new Map();
    this.documents = new Map();
    
    // デフォルトユーザーを作成
    this.createDefaultUser();
  }

  private async createDefaultUser() {
    const defaultUser: User = {
      id: 'default-user',
      name: '山田太郎',
      phone: '090-1234-5678',
      address: '愛知県知多郡南知多町篠島'
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByName(name: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.name === name);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      name: insertUser.name,
      phone: insertUser.phone || null,
      address: insertUser.address || null,
    };
    this.users.set(id, user);
    return user;
  }

  // Shipment methods
  async getShipments(userId: string): Promise<Shipment[]> {
    return Array.from(this.shipments.values())
      .filter(shipment => shipment.userId === userId)
      .sort((a, b) => new Date(b.shipmentDate).getTime() - new Date(a.shipmentDate).getTime());
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const id = randomUUID();
    const shipment: Shipment = {
      id,
      ...insertShipment,
      shipmentDate: insertShipment.shipmentDate || new Date(),
      createdAt: new Date(),
    };
    this.shipments.set(id, shipment);
    return shipment;
  }

  async getShipmentById(id: string): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }

  // Expense methods
  async getExpenses(userId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId)
      .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      id,
      ...insertExpense,
      expenseDate: insertExpense.expenseDate || new Date(),
      createdAt: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  // Inventory methods
  async getInventory(userId: string): Promise<InventoryItem[]> {
    return Array.from(this.inventory.values())
      .filter(item => item.userId === userId);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const item: InventoryItem = {
      id,
      ...insertItem,
      lastUpdated: new Date(),
    };
    this.inventory.set(id, item);
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const existingItem = this.inventory.get(id);
    if (!existingItem) {
      throw new Error(`Inventory item with id ${id} not found`);
    }
    
    const updatedItem: InventoryItem = {
      ...existingItem,
      ...updates,
      lastUpdated: new Date(),
    };
    this.inventory.set(id, updatedItem);
    return updatedItem;
  }

  // Document methods
  async getDocuments(userId: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      id,
      ...insertDocument,
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }
}

export const storage = new MemStorage();