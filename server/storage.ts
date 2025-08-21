import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, users, conversations, messages } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import { writeFileSync, readFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import * as crypto from 'crypto';
import { z } from 'zod';
import { insertConversationSchema } from "@shared/schemas";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // File management methods
  getProjectFiles?(projectName: string): Promise<Array<{name: string, type: string}>>;
  getFileContent?(projectName: string, fileName: string): Promise<string>;
  saveFile?(projectName: string, fileName: string, content: string): Promise<void>;
  // Project management methods
  getAllProjects?(): Promise<any[]>;
  createProject?(projectData: any): Promise<any>;
  getProject?(projectName: string): Promise<any | null>;
  // Chat management methods
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  getProjectConversations?(projectName: string): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined>;
  addMessage(message: InsertMessage): Promise<Message>;
  getMessages(conversationId: string): Promise<Message[]>;
  deleteConversation(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projectFiles: Record<string, any[]>;
  private fileContents: Record<string, Record<string, string>>;
  private conversations: Conversation[];
  private messages: Message[];
  private projects: any[];

  constructor() {
    this.users = new Map();
    this.projectFiles = {
      "sample-project": [
        { name: "index.html", type: "file", content: "" },
        { name: "portfolio.html", type: "file", content: "" }
      ]
    };
    this.fileContents = {
      "sample-project": {}
    };
    this.conversations = [];
    this.messages = [];
    this.projects = [
      {
        id: "sample-project",
        name: "sample-project",
        displayName: "Sample Project",
        path: "./sample-project",
        createdAt: new Date().toISOString()
      }
    ];
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

  async getAllProjects(): Promise<any[]> {
    return this.projects;
  }

  async createProject(projectData: any): Promise<any> {
    const newProject = {
      id: projectData.name,
      ...projectData,
      createdAt: new Date().toISOString()
    };
    this.projects.push(newProject);

    // Initialize empty file structure for new project
    this.projectFiles[projectData.name] = [];
    this.fileContents[projectData.name] = {};

    return newProject;
  }

  async getProject(projectName: string): Promise<any | null> {
    return this.projects.find(p => p.name === projectName) || null;
  }

  async getProjectFiles(projectName: string): Promise<Array<{name: string, type: string}>> {
    return this.projectFiles[projectName] || [];
  }

  async getFileContent(projectName: string, fileName: string): Promise<string> {
    return this.fileContents[projectName]?.[fileName] || '';
  }

  async saveFile(projectName: string, fileName: string, content: string): Promise<void> {
    if (!this.fileContents[projectName]) {
      this.fileContents[projectName] = {};
    }
    this.fileContents[projectName][fileName] = content;

    if (!this.projectFiles[projectName]) {
      this.projectFiles[projectName] = [];
    }

    const existingFile = this.projectFiles[projectName].find(f => f.name === fileName);
    if (!existingFile) {
      this.projectFiles[projectName].push({
        name: fileName,
        type: 'file',
        content: content
      });
    } else {
      existingFile.content = content; // Update content if file exists
    }
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
    this.conversations.push(conversation);
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.find(c => c.id === id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    return this.conversations.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getProjectConversations(projectName: string): Promise<Conversation[]> {
    return this.conversations.filter(c => c.projectName === projectName).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.find(c => c.id === id);
    if (!conversation) return undefined;

    const updated: Conversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date(),
    };

    const index = this.conversations.findIndex(c => c.id === id);
    if (index !== -1) {
      this.conversations[index] = updated;
    }
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

    this.messages.push(message);

    // Update conversation's updatedAt timestamp
    await this.updateConversation(insertMessage.conversationId, {});

    return message;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  async deleteConversation(id: string): Promise<boolean> {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index !== -1) {
      this.conversations.splice(index, 1);
      // Also delete associated messages
      const messageIndices = this.messages.map((m, i) => m.conversationId === id ? i : -1).filter(i => i !== -1);
      messageIndices.reverse().forEach(i => this.messages.splice(i, 1));
      return true;
    }
    return false;
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

  async getAllProjects(): Promise<any[]> {
    const result = await this.db.select().from(projects);
    return result;
  }

  async createProject(projectData: any): Promise<any> {
    const newProject = {
      ...projectData,
      createdAt: new Date().toISOString()
    };
    const result = await this.db.insert(projects).values(newProject).returning();
    return result[0];
  }

  async getProject(projectName: string): Promise<any | null> {
    const result = await this.db.select().from(projects).where(eq(projects.name, projectName)).limit(1);
    return result[0] || null;
  }

  async getProjectFiles(projectName: string): Promise<Array<{name: string, type: string}>> {
    const projectPath = join(process.cwd(), 'projects', projectName);

    if (!existsSync(projectPath)) {
      return [];
    }

    try {
      const files = readdirSync(projectPath);
      return files.map(fileName => {
        const filePath = join(projectPath, fileName);
        const stats = statSync(filePath);
        const ext = extname(fileName);

        let type = 'file';
        if (stats.isDirectory()) {
          type = 'directory';
        } else if (['.html', '.htm'].includes(ext)) {
          type = 'html';
        } else if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
          type = 'javascript';
        } else if (['.css', '.scss', '.sass'].includes(ext)) {
          type = 'css';
        } else if (['.json'].includes(ext)) {
          type = 'json';
        } else if (['.md', '.txt'].includes(ext)) {
          type = 'text';
        }

        return { name: fileName, type };
      }).filter(file => file.type !== 'directory'); // Only return files, not directories
    } catch (error) {
      console.error(`Error reading project files for ${projectName}:`, error);
      return [];
    }
  }

  async getFileContent(projectName: string, fileName: string): Promise<string> {
    const filePath = join(process.cwd(), 'projects', projectName, fileName);

    try {
      if (existsSync(filePath)) {
        return readFileSync(filePath, 'utf-8');
      }
      return '';
    } catch (error) {
      console.error(`Error reading file ${fileName} in project ${projectName}:`, error);
      return '';
    }
  }

  async saveFile(projectName: string, fileName: string, content: string): Promise<void> {
    const projectPath = join(process.cwd(), 'projects', projectName);
    const filePath = join(projectPath, fileName);

    try {
      // Create project directory if it doesn't exist
      if (!existsSync(projectPath)) {
        mkdirSync(projectPath, { recursive: true });
      }

      // Write the file
      writeFileSync(filePath, content, 'utf-8');
      console.log(`File saved: ${filePath}`);
    } catch (error) {
      console.error(`Error saving file ${fileName} in project ${projectName}:`, error);
      throw error;
    }
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

  async getProjectConversations(projectName: string): Promise<Conversation[]> {
    const result = await this.db.select().from(conversations).where(eq(conversations.projectName, projectName)).orderBy(desc(conversations.updatedAt));
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
export const storage: IStorage = process.env.DATABASE_URL ? new PostgresStorage() : new MemStorage();