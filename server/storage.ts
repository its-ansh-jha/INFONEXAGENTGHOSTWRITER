import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, users, conversations, messages } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // File management methods
  getProjectFiles?(projectName: string): Array<{name: string, type: string}>;
  getFileContent?(projectName: string, fileName: string): string;
  saveFile?(projectName: string, fileName: string, content: string): void;
  // Chat management methods
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined>;
  addMessage(message: InsertMessage): Promise<Message>;
  getMessages(conversationId: string): Promise<Message[]>;
  deleteConversation(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projectFiles: Map<string, Map<string, string>>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message[]>;

  constructor() {
    this.users = new Map();
    this.projectFiles = new Map();
    this.conversations = new Map();
    this.messages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  getProjectFiles(projectName: string): Array<{name: string, type: string}> {
    const files = this.projectFiles.get(projectName);
    if (!files) return [];
    
    return Array.from(files.keys()).map(fileName => ({
      name: fileName,
      type: fileName.endsWith('.html') ? 'html' : 
            fileName.endsWith('.css') ? 'css' :
            fileName.endsWith('.js') ? 'javascript' : 'text'
    }));
  }

  getFileContent(projectName: string, fileName: string): string {
    const files = this.projectFiles.get(projectName);
    return files?.get(fileName) || '';
  }

  saveFile(projectName: string, fileName: string, content: string): void {
    if (!this.projectFiles.has(projectName)) {
      this.projectFiles.set(projectName, new Map());
    }
    
    const files = this.projectFiles.get(projectName)!;
    files.set(fileName, content);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated: Conversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date(),
    };
    this.conversations.set(id, updated);
    return updated;
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      metadata: insertMessage.metadata || null,
    };
    
    // Add to messages array for this conversation
    const conversationMessages = this.messages.get(insertMessage.conversationId) || [];
    conversationMessages.push(message);
    this.messages.set(insertMessage.conversationId, conversationMessages);
    
    // Update conversation's updatedAt timestamp
    await this.updateConversation(insertMessage.conversationId, {});
    
    return message;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.messages.get(conversationId) || [];
  }

  async deleteConversation(id: string): Promise<boolean> {
    const deleted = this.conversations.delete(id);
    this.messages.delete(id);
    return deleted;
  }
}

// PostgreSQL Storage Implementation
export class PostgresStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  getProjectFiles(projectName: string): Array<{name: string, type: string}> {
    // For now, return empty array - this would require file system integration
    return [];
  }

  getFileContent(projectName: string, fileName: string): string {
    // For now, return empty string - this would require file system integration
    return '';
  }

  saveFile(projectName: string, fileName: string, content: string): void {
    // For now, do nothing - this would require file system integration
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const result = await this.db.insert(conversations).values(insertConversation).returning();
    return result[0];
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await this.db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async getAllConversations(): Promise<Conversation[]> {
    const result = await this.db.select().from(conversations).orderBy(desc(conversations.updatedAt));
    return result;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const result = await this.db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return result[0];
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await this.db.insert(messages).values(insertMessage).returning();
    
    // Update conversation's updatedAt timestamp
    await this.updateConversation(insertMessage.conversationId, {});
    
    return result[0];
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const result = await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
    return result;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const result = await this.db.delete(conversations).where(eq(conversations.id, id)).returning();
    return result.length > 0;
  }
}

// Use PostgreSQL storage in production, fallback to memory storage for development
export const storage = process.env.DATABASE_URL ? new PostgresStorage() : new MemStorage();
