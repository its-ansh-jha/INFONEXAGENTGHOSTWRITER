import { join, extname } from 'path';
import * as crypto from 'crypto';
import { z } from 'zod';
import { insertConversationSchema } from "@shared/schema";
import { db } from './index';
import { conversations, messages, projects } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

// modify the interface with any CRUD methods
// you might need
export interface Storage {
  // Projects
  createProject(project: any): Promise<any>;
  getAllProjects(): Promise<any[]>;
  getProject(id: string): Promise<any | null>;
  updateProject(id: string, updates: any): Promise<any>;
  deleteProject(id: string): Promise<boolean>;

  // Conversations
  createConversation(conversation: any): Promise<any>;
  getAllConversations(filters?: any): Promise<any[]>;
  getConversation(id: string): Promise<any | null>;
  updateConversation(id: string, updates: any): Promise<any>;
  deleteConversation(id: string): Promise<boolean>;

  // Messages
  createMessage(message: any): Promise<any>;
  getMessages(conversationId: string): Promise<any[]>;
  updateMessage(id: string, updates: any): Promise<any>;
  deleteMessage(id: string): Promise<boolean>;

  // Files
  writeFile(projectName: string, filename: string, content: string): Promise<void>;
  readFile(projectName: string, filename: string): Promise<string>;
  deleteFile(projectName: string, filename: string): Promise<void>;
  listFiles(projectName: string): Promise<any[]>;
}

export class MemoryStorage implements Storage {
  private projects: any[] = [];
  private conversations: any[] = [];
  private messages: any[] = [];
  private files: Map<string, string> = new Map();

  async createProject(project: any): Promise<any> {
    const id = crypto.randomUUID();
    const newProject = { id, ...project, createdAt: new Date() };
    this.projects.push(newProject);
    return newProject;
  }

  async getAllProjects(): Promise<any[]> {
    return this.projects;
  }

  async getProject(id: string): Promise<any | null> {
    return this.projects.find(p => p.id === id) || null;
  }

  async updateProject(id: string, updates: any): Promise<any> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Project not found');
    this.projects[index] = { ...this.projects[index], ...updates };
    return this.projects[index];
  }

  async deleteProject(id: string): Promise<boolean> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.projects.splice(index, 1);
    return true;
  }

  async createConversation(conversation: any): Promise<any> {
    const id = crypto.randomUUID();
    const newConversation = { id, ...conversation, createdAt: new Date() };
    this.conversations.push(newConversation);
    return newConversation;
  }

  async getAllConversations(filters?: any): Promise<any[]> {
    return this.conversations;
  }

  async getConversation(id: string): Promise<any | null> {
    return this.conversations.find(c => c.id === id) || null;
  }

  async updateConversation(id: string, updates: any): Promise<any> {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Conversation not found');
    this.conversations[index] = { ...this.conversations[index], ...updates };
    return this.conversations[index];
  }

  async deleteConversation(id: string): Promise<boolean> {
    const index = this.conversations.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.conversations.splice(index, 1);
    return true;
  }

  async createMessage(message: any): Promise<any> {
    const id = crypto.randomUUID();
    const newMessage = { id, ...message, createdAt: new Date() };
    this.messages.push(newMessage);
    return newMessage;
  }

  async getMessages(conversationId: string): Promise<any[]> {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  async updateMessage(id: string, updates: any): Promise<any> {
    const index = this.messages.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Message not found');
    this.messages[index] = { ...this.messages[index], ...updates };
    return this.messages[index];
  }

  async deleteMessage(id: string): Promise<boolean> {
    const index = this.messages.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.messages.splice(index, 1);
    return true;
  }

  async writeFile(projectName: string, filename: string, content: string): Promise<void> {
    const key = `${projectName}/${filename}`;
    this.files.set(key, content);
  }

  async readFile(projectName: string, filename: string): Promise<string> {
    const key = `${projectName}/${filename}`;
    const content = this.files.get(key);
    if (content === undefined) {
      throw new Error(`File not found: ${filename}`);
    }
    return content;
  }

  async deleteFile(projectName: string, filename: string): Promise<void> {
    const key = `${projectName}/${filename}`;
    this.files.delete(key);
  }

  async listFiles(projectName: string): Promise<any[]> {
    const prefix = `${projectName}/`;
    const files: any[] = [];

    for (const [key, content] of this.files.entries()) {
      if (key.startsWith(prefix)) {
        const filename = key.substring(prefix.length);
        files.push({
          name: filename,
          type: 'file',
          extension: extname(filename),
          size: content.length
        });
      }
    }

    return files;
  }
}

export class PostgresStorage implements Storage {
  async createProject(project: any): Promise<any> {
    const [result] = await db.insert(projects).values(project).returning();
    return result;
  }

  async getAllProjects(): Promise<any[]> {
    return await db.select().from(projects);
  }

  async getProject(id: string): Promise<any | null> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0] || null;
  }

  async updateProject(id: string, updates: any): Promise<any> {
    const [result] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return result;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  async createConversation(conversation: any): Promise<any> {
    const [result] = await db.insert(conversations).values(conversation).returning();
    return result;
  }

  async getAllConversations(filters?: any): Promise<any[]> {
    let query = db.select().from(conversations);

    if (filters?.projectId) {
      query = query.where(eq(conversations.projectId, filters.projectId));
    }

    return await query.orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: string): Promise<any | null> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id));
    return result[0] || null;
  }

  async updateConversation(id: string, updates: any): Promise<any> {
    const [result] = await db.update(conversations).set(updates).where(eq(conversations.id, id)).returning();
    return result;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id));
    return result.rowCount > 0;
  }

  async createMessage(message: any): Promise<any> {
    const [result] = await db.insert(messages).values(message).returning();
    return result;
  }

  async getMessages(conversationId: string): Promise<any[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId));
  }

  async updateMessage(id: string, updates: any): Promise<any> {
    const [result] = await db.update(messages).set(updates).where(eq(messages.id, id)).returning();
    return result;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return result.rowCount > 0;
  }

  async writeFile(projectName: string, filename: string, content: string): Promise<void> {
    // File operations would be implemented based on your file storage strategy
    throw new Error('File operations not implemented for PostgresStorage');
  }

  async readFile(projectName: string, filename: string): Promise<string> {
    throw new Error('File operations not implemented for PostgresStorage');
  }

  async deleteFile(projectName: string, filename: string): Promise<void> {
    throw new Error('File operations not implemented for PostgresStorage');
  }

  async listFiles(projectName: string): Promise<any[]> {
    throw new Error('File operations not implemented for PostgresStorage');
  }
}

// Export a storage instance
export const storage: Storage = process.env.DATABASE_URL 
  ? new PostgresStorage() 
  : new MemoryStorage();