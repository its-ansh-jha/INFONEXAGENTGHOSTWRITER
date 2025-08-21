
import { type Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import gpt5Routes from "./routes/gpt5";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // GPT-5 routes
  app.use("/api/gpt5", gpt5Routes);

  // Projects API
  app.get("/api/projects", async (req, res) => {
    try {
      // Return sample projects for now
      const projects = [
        {
          id: "sample-project",
          name: "sample-project", 
          displayName: "Sample Project",
          path: "./projects/sample-project",
          sessions: []
        }
      ];
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // File management routes
  app.get("/api/projects/:projectName/files", async (req, res) => {
    try {
      const { projectName } = req.params;
      const files = storage.getProjectFiles?.(projectName) || [];
      res.json({ files });
    } catch (error) {
      console.error("Error fetching project files:", error);
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.get("/api/projects/:projectName/files/:fileName", async (req, res) => {
    try {
      const { projectName, fileName } = req.params;
      const content = storage.getFileContent?.(projectName, fileName) || "";
      res.json({ content });
    } catch (error) {
      console.error("Error fetching file content:", error);
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  });

  app.post("/api/projects/:projectName/files/:fileName", async (req, res) => {
    try {
      const { projectName, fileName } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      storage.saveFile?.(projectName, fileName, content);
      res.json({ success: true, message: "File saved successfully" });
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ error: "Failed to save file" });
    }
  });

  // Conversations API
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json({ conversations });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const { title, projectId } = req.body;
      const conversation = await storage.createConversation({
        title: title || "New Conversation",
        projectId: projectId || null,
      });
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { role, content, metadata } = req.body;
      const message = await storage.addMessage({
        conversationId: req.params.id,
        role: role || "user",
        content,
        metadata: metadata || null,
      });
      res.json(message);
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(500).json({ error: "Failed to add message" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteConversation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  return httpServer;
}
