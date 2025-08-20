import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from 'openai';

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

      // Using gpt-4o for now as it's more stable than gpt-5 preview
      const requestParams = {
        model: model,
        messages: messages,
        max_tokens: options.max_tokens || options.max_completion_tokens || 4000,
        temperature: 0.7
      };

      const response = await openai.chat.completions.create(requestParams);

      res.json({
        success: true,
        data: response,
        usage: response.usage
      });

    } catch (error) {
      console.error('GPT-5 API Error:', error);
      
      if (error.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid OpenAI API key',
          message: 'Please check your OpenAI API key configuration'
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message || 'Failed to process GPT-5 request'
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
    
    if (!content) {
      return res.status(400).json({ error: "File content is required" });
    }
    
    // Mock file saving - in real implementation, this would write to actual files
    if (storage.saveFile) {
      storage.saveFile(projectName, fileName, content);
    }
    
    res.json({ success: true, message: "File saved successfully" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
