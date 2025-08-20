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

      // Add system prompt for environment variable handling if not already present
      const hasSystemPrompt = messages.some(msg => msg.role === 'system');
      if (!hasSystemPrompt) {
        messages.unshift({
          role: 'system',
          content: `You are an AI assistant that helps with coding tasks. When creating applications that require API keys or sensitive configuration:

1. ALWAYS create a .env file when the application needs environment variables
2. Use placeholder values like YOUR_API_KEY, YOUR_SECRET_KEY, etc.
3. Tell the user to replace these placeholders with their actual values
4. If additional environment variables are needed later, append them to the existing .env file
5. Common environment variables to create:
   - OPENAI_API_KEY=YOUR_API_KEY
   - GOOGLE_API_KEY=YOUR_API_KEY  
   - DATABASE_URL=YOUR_DATABASE_URL
   - JWT_SECRET=YOUR_JWT_SECRET
   - STRIPE_SECRET_KEY=YOUR_STRIPE_KEY

Example .env file format:
OPENAI_API_KEY=YOUR_API_KEY
GOOGLE_API_KEY=YOUR_API_KEY

Always inform users: "I've created a .env file with placeholder values. Please edit this file and replace YOUR_API_KEY with your actual API keys."`
        });
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
    const { content, append = false } = req.body;
    
    if (content === undefined || content === null) {
      return res.status(400).json({ error: "File content is required" });
    }
    
    let finalContent = content;
    
    // Handle .env file appending
    if (fileName === '.env' && append) {
      const existingContent = storage.getFileContent ? storage.getFileContent(projectName, fileName) : '';
      if (existingContent) {
        // Check if the new environment variable already exists
        const existingLines = existingContent.split('\n').filter(line => line.trim());
        const newLines = content.split('\n').filter(line => line.trim());
        
        const newVars = [];
        newLines.forEach(newLine => {
          const varName = newLine.split('=')[0];
          const existsAlready = existingLines.some(existingLine => 
            existingLine.split('=')[0] === varName
          );
          if (!existsAlready) {
            newVars.push(newLine);
          }
        });
        
        if (newVars.length > 0) {
          finalContent = existingContent + '\n' + newVars.join('\n');
        } else {
          finalContent = existingContent; // No new variables to add
        }
      }
    }
    
    // Mock file saving - in real implementation, this would write to actual files
    // This will replace existing files or create new ones
    if (storage.saveFile) {
      storage.saveFile(projectName, fileName, finalContent);
    }
    
    res.json({ success: true, message: "File updated successfully" });
  });

  // Endpoint specifically for appending environment variables
  app.post("/api/projects/:projectName/env", (req, res) => {
    const { projectName } = req.params;
    const { variables } = req.body; // Array of {key: value} pairs
    
    if (!variables || !Array.isArray(variables)) {
      return res.status(400).json({ error: "Variables array is required" });
    }
    
    const existingContent = storage.getFileContent ? storage.getFileContent(projectName, '.env') : '';
    const existingLines = existingContent.split('\n').filter(line => line.trim());
    
    let newContent = existingContent;
    const addedVars = [];
    
    variables.forEach(({ key, value }) => {
      const envLine = `${key}=${value}`;
      const existsAlready = existingLines.some(line => 
        line.split('=')[0] === key
      );
      
      if (!existsAlready) {
        newContent = newContent ? newContent + '\n' + envLine : envLine;
        addedVars.push(key);
      }
    });
    
    if (storage.saveFile) {
      storage.saveFile(projectName, '.env', newContent);
    }
    
    res.json({ 
      success: true, 
      message: `Environment variables updated: ${addedVars.join(', ')}`,
      addedVariables: addedVars
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
