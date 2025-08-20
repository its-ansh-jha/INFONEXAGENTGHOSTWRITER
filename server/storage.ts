import { type User, type InsertUser } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projectFiles: Map<string, Map<string, string>>;

  constructor() {
    this.users = new Map();
    this.projectFiles = new Map();
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
}

export const storage = new MemStorage();
