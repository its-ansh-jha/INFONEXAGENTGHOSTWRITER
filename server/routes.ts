import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from 'openai';
import archiver from 'archiver';
import { existsSync, createReadStream, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { Router } from 'express';
import { storage } from './storage';
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = Router();

// OpenAI function tools for file operations
const fileOperationTools = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the content of a file in the current project",
      parameters: {
        type: "object",
        properties: {
          filename: {
            type: "string",
            description: "The name of the file to read (e.g., 'index.html', 'style.css')"
          }
        },
        required: ["filename"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Create or update a file in the current project",
      parameters: {
        type: "object",
        properties: {
          filename: {
            type: "string",
            description: "The name of the file to create/update (e.g., 'index.html', 'script.js')"
          },
          content: {
            type: "string",
            description: "The complete content to write to the file"
          }
        },
        required: ["filename", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List all files in the current project",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
];

// GPT-5 Chat endpoint with OpenAI tools
router.post('/gpt5/chat', async (req, res) => {
  try {
    const {
      model = 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      project_name,
      use_tools = true,
      max_tokens = 10000,
      ...options
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const requestParams: any = {
      model: model,
      messages: messages,
      max_tokens: max_tokens,
      temperature: 0.7,
      ...options
    };

    // Add tools if requested
    if (use_tools) {
      requestParams.tools = fileOperationTools;
      requestParams.tool_choice = "auto";
    }

    const response = await openai.chat.completions.create(requestParams);

    // Handle tool calls if present
    if (response.choices[0].message.tool_calls) {
      const toolResults = [];

      for (const toolCall of response.choices[0].message.tool_calls) {
        const { name, arguments: args } = toolCall.function;
        const parsedArgs = JSON.parse(args);

        try {
          let result;
          switch (name) {
            case 'read_file':
              try {
                const projectPath = join(process.cwd(), 'projects', project_name || 'sample-project');
                const filePath = join(projectPath, parsedArgs.filename);

                if (existsSync(filePath)) {
                  const fs = await import('fs/promises');
                  const content = await fs.readFile(filePath, 'utf-8');
                  result = content || 'File is empty';
                } else {
                  result = `Error: File '${parsedArgs.filename}' not found`;
                }
              } catch (error: any) {
                result = `Error reading file: ${error.message}`;
              }
              break;

            case 'write_file':
              try {
                const projectPath = join(process.cwd(), 'projects', project_name || 'sample-project');
                const filePath = join(projectPath, parsedArgs.filename);

                const fs = await import('fs/promises');
                // Ensure directory exists
                await fs.mkdir(projectPath, { recursive: true });
                await fs.writeFile(filePath, parsedArgs.content, 'utf-8');
                result = `Successfully created/updated '${parsedArgs.filename}'`;
              } catch (error: any) {
                result = `Error writing file: ${error.message}`;
              }
              break;

            case 'list_files':
              try {
                const projectPath = join(process.cwd(), 'projects', project_name || 'sample-project');

                if (existsSync(projectPath)) {
                  const files = readdirSync(projectPath);
                  const filesList = files.map(fileName => {
                    const filePath = join(projectPath, fileName);
                    const stat = statSync(filePath);
                    return `${fileName} (${stat.isDirectory() ? 'directory' : 'file'})`;
                  }).join('\n');
                  result = `Current project files:\n${filesList || 'No files found'}`;
                } else {
                  result = 'Project directory not found';
                }
              } catch (error: any) {
                result = `Error listing files: ${error.message}`;
              }
              break;

            default:
              result = `Unknown tool: ${name}`;
          }

          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: result
          });
        } catch (error: any) {
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: `Error executing ${name}: ${error.message}`
          });
        }
      }

      // Send back with tool results for follow-up response
      res.json({
        success: true,
        data: response,
        tool_results: toolResults,
        usage: response.usage,
        needs_followup: true
      });
    } else {
      res.json({
        success: true,
        data: response,
        usage: response.usage
      });
    }

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
      message: error?.message || 'Failed to process GPT request'
    });
  }
});

// Projects routes
router.get('/projects', async (req, res) => {
  try {
    const projects = await storage.getAllProjects();
    res.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { name, displayName, path } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const projectData = {
      name: name.toLowerCase().replace(/\s+/g, '-'),
      displayName: displayName || name,
      path: path || `./${name.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString()
    };

    const newProject = await storage.createProject(projectData);
    res.json({ success: true, project: newProject });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(400).json({ error: 'Failed to create project', message: error?.message });
  }
});

// File management endpoints
router.get('/projects/:projectName/files', async (req, res) => {
  try {
    const { projectName } = req.params;
    const files = await storage.getProjectFiles(projectName);
    res.json({ files });
  } catch (error: any) {
    console.error('Error fetching project files:', error);
    res.status(500).json({ error: 'Failed to fetch project files' });
  }
});

router.get('/projects/:projectName/files/:fileName', async (req, res) => {
  try {
    const { projectName, fileName } = req.params;
    const content = await storage.getFileContent(projectName, fileName);
    res.json({ content });
  } catch (error: any) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

router.post('/projects/:projectName/files/:fileName', async (req, res) => {
  try {
    const { projectName, fileName } = req.params;
    const { content } = req.body;

    if (content === undefined || content === null) {
      return res.status(400).json({ error: "File content is required" });
    }

    await storage.saveFile(projectName, fileName, content);
    res.json({ success: true, message: "File updated successfully" });
  } catch (error: any) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// Chat conversation endpoints
router.get("/api/conversations", async (req, res) => {
  try {
    const { projectName } = req.query;

    if (projectName) {
      // Get conversations for specific project
      const conversations = await storage.getProjectConversations(projectName as string);
      res.json({ conversations });
    } else {
      // Get all conversations if no project specified
      const conversations = await storage.getAllConversations();
      res.json({ conversations });
    }
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.post("/api/conversations", async (req, res) => {
  try {
    const validatedData = insertConversationSchema.parse(req.body);
    const conversation = await storage.createConversation(validatedData);
    res.json({ success: true, conversation });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(400).json({ error: 'Failed to create conversation', message: error?.message });
  }
});

router.get("/api/conversations/:id", async (req, res) => {
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

router.put("/api/conversations/:id", async (req, res) => {
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

router.delete("/api/conversations/:id", async (req, res) => {
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

router.get("/api/conversations/:id/messages", async (req, res) => {
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

router.post("/api/conversations/:id/messages", async (req, res) => {
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
router.get("/api/projects/:projectName/download", async (req, res) => {
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

export function registerRoutes(app: Express): Server {
  app.use('/api', router); // Mount the router

  const httpServer = createServer(app);
  return httpServer;
}