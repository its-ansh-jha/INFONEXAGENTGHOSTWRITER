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

      // the newest OpenAI model is "gpt-5" which was released August 7, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        reasoning_effort: reasoning_effort,
        verbosity: verbosity,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 4000,
        ...options
      });

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

  const httpServer = createServer(app);
  return httpServer;
}
