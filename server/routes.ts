import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import OpenAI from 'openai';
import archiver from 'archiver';
import { existsSync, createReadStream, statSync, readdirSync } from 'fs';
import { join } from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // GPT-5 Chat endpoint
  app.post('/api/gpt5/chat', async (req, res) => {
    try {
      const { model = 'gpt-5', messages, reasoning_effort = 'minimal', verbosity = 'medium', ...options } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // GPT-5 requires max_completion_tokens instead of max_tokens
      // GPT-5 only supports default temperature value (1)
      const requestParams = {
        model: model,
        messages: messages,
        reasoning_effort: reasoning_effort,
        verbosity: verbosity,
        max_completion_tokens: options.max_completion_tokens || options.max_tokens || 10000
      };

      const response = await openai.chat.completions.create(requestParams);

      res.json({
        success: true,
        data: response,
        usage: response.usage
      });

    } catch (error: any) {
      console.error('GPT-5 API Error:', error);
      
      if (error.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid OpenAI API key',
          message: 'Please check your OpenAI API key configuration'
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: error?.message || 'Failed to process GPT-5 request'
      });
    }
  });

  // Mock projects endpoint
  app.get("/api/projects", (req, res) => {
    res.json([
      {
        name: "sample-project",
        displayName: "Sample Project",
        path: "./sample-project",
        sessions: []
      }
    ]);
  });

  // Create new project endpoint
  app.post("/api/projects", (req, res) => {
    const { name, displayName, path } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }
    
    const newProject = {
      name: name.toLowerCase().replace(/\s+/g, '-'),
      displayName: displayName || name,
      path: path || `./${name.toLowerCase().replace(/\s+/g, '-')}`,
      sessions: [],
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, project: newProject });
  });

  // File management endpoints
  app.get("/api/projects/:projectName/files", (req, res) => {
    const { projectName } = req.params;
    
    // Mock file system - in real implementation, this would read from actual files
    const mockFiles = storage.getProjectFiles ? storage.getProjectFiles(projectName) : [];
    
    res.json({ files: mockFiles });
  });

  app.get("/api/projects/:projectName/files/:fileName", (req, res) => {
    const { projectName, fileName } = req.params;
    
    // Mock file content - in real implementation, this would read actual file content
    const content = storage.getFileContent ? storage.getFileContent(projectName, fileName) : '';
    
    res.json({ content });
  });

  app.post("/api/projects/:projectName/files/:fileName", (req, res) => {
    const { projectName, fileName } = req.params;
    const { content } = req.body;
    
    if (content === undefined || content === null) {
      return res.status(400).json({ error: "File content is required" });
    }
    
    // Mock file saving - in real implementation, this would write to actual files
    // This will replace existing files or create new ones
    if (storage.saveFile) {
      storage.saveFile(projectName, fileName, content);
    }
    
    res.json({ success: true, message: "File updated successfully" });
  });

  // Chat conversation endpoints
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json({ conversations });
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json({ success: true, conversation });
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      res.status(400).json({ error: 'Failed to create conversation', message: error?.message });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      res.json({ conversation });
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  });

  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertConversationSchema.partial().parse(req.body);
      const conversation = await storage.updateConversation(id, updates);
      
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      res.json({ success: true, conversation });
    } catch (error: any) {
      console.error('Error updating conversation:', error);
      res.status(400).json({ error: 'Failed to update conversation', message: error?.message });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteConversation(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      res.json({ success: true, message: 'Conversation deleted' });
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify conversation exists
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      const messages = await storage.getMessages(id);
      res.json({ messages });
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify conversation exists
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      const messageData = { ...req.body, conversationId: id };
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.addMessage(validatedData);
      
      res.json({ success: true, message });
    } catch (error: any) {
      console.error('Error adding message:', error);
      res.status(400).json({ error: 'Failed to add message', message: error?.message });
    }
  });

  // Download project as zip
  app.get("/api/projects/:projectName/download", async (req, res) => {
    try {
      const { projectName } = req.params;
      const projectPath = join(process.cwd(), 'projects', projectName);
      
      if (!existsSync(projectPath)) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${projectName}.zip"`);
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to create zip file' });
        }
      });
      
      archive.pipe(res);
      
      // Add all files in the project directory to the zip
      const files = readdirSync(projectPath);
      for (const file of files) {
        const filePath = join(projectPath, file);
        const stats = statSync(filePath);
        
        if (stats.isFile()) {
          archive.file(filePath, { name: file });
        }
      }
      
      await archive.finalize();
      console.log(`Project ${projectName} downloaded as zip`);
      
    } catch (error: any) {
      console.error('Error creating project zip:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create zip file' });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
