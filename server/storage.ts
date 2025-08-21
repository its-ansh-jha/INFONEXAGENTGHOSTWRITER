import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

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

export const storage = new MemStorage();
