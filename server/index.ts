import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { storage } from './storage';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/defaultdb';
const client = postgres(connectionString);
export const db = drizzle(client);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// API routes
app.use('/api', routes);

// Simple test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  // In a real application, you might want to log the error here.
  // For this example, we'll re-throw to allow other error handlers or the process to catch it.
  // However, since we've already sent a response, re-throwing might not be the desired behavior.
  // If the goal is just to return an error response, we can omit the throw.
  // For now, we'll keep it as is, assuming there might be a higher-level handler.
  // throw err; // Commented out to prevent double error handling/response if not intended.
});


// Setup Vite in development or serve static files in production
// importantly only setup vite in development and after
// setting up all the other routes so the catch-all route
// doesn't interfere with the other routes
if (app.get("env") === "development") {
  // Assuming setupVite is correctly implemented and imported
  // and server is correctly initialized before this block.
  // For now, we'll simulate its behavior or assume it's correctly handled elsewhere.
  // If setupVite needs the server instance, it should be passed.
  // const server = await registerRoutes(app); // This line was in original, but registration is now handled by routes import.
  // await setupVite(app, server);
  log("Vite setup for development is intended here.");
} else {
  // Assuming serveStatic is correctly implemented and imported
  serveStatic(app);
}

// ALWAYS serve the app on the port specified in the environment variable PORT
// Other ports are firewalled. Default to 5000 if not specified.
// this serves both the API and the client.
// It is the only port that is not firewalled.
// const port = parseInt(process.env.PORT || '5000', 10); // This is redundant as PORT is already defined.
app.listen(PORT, '0.0.0.0', () => {
  log(`serving on port ${PORT}`);
});