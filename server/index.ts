import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";

import { appConfig } from './config';
import { connectDB, disconnectDB } from './db';

// Simple logger function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
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

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});

(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Register API routes
    const server = await registerRoutes(app);

    // Setup development or production mode
    if (app.get("env") === "development") {
      // Simple development server for client files
      log("Running in development mode - serving client files");
      // Serve static files from client directory if they exist
      const clientDir = path.resolve(process.cwd(), "client");
      if (fs.existsSync(clientDir)) {
        app.use(express.static(clientDir));
      }
      
      // Fallback route for SPA - serve index.html if it exists
      const indexHtml = path.resolve(clientDir, "index.html");
      if (fs.existsSync(indexHtml)) {
        app.use("*", (_req, res) => {
          res.sendFile(indexHtml);
        });
      }
    } else {
      // Production mode - serve from dist/public if it exists
      const distPath = path.resolve(process.cwd(), "dist/public");
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use("*", (_req, res) => {
          res.sendFile(path.resolve(distPath, "index.html"));
        });
      }
    }

    // Start the server
    const port = appConfig.server.port;
    const serverInstance = server.listen(port, () => {
      log(`Server is running on port ${port}`);
      log(`Environment: ${appConfig.server.nodeEnv}`);
    });

    // Handle server errors
    serverInstance.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use. Please try a different port or close the application using this port.`);
        process.exit(1);
      } else {
        log(`Server error: ${error.message}`);
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGTERM', async () => {
      log('SIGTERM received. Closing server...');
      await disconnectDB();
      serverInstance.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      log('SIGINT received. Closing server...');
      await disconnectDB();
      serverInstance.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
})();
