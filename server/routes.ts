import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { DatabaseStorage } from "./storage";
import { analyzeSentiment } from "./services/sentiment";
import { fetchTweets } from "./services/twitter";
import { executeTrade } from "./services/trading";
import { setupAuth } from "./auth";
import {
  tweetSchema,
  coinSchema,
  tradeSchema,
  configSchema,
  statsSchema,
  type Tweet,
  type Trade
} from "@shared/schema";
import bcrypt from "bcrypt";

// Initialize storage
const storage = new DatabaseStorage();

// WebSocket connections
let wsConnections: WebSocket[] = [];

// Broadcast message to all connected clients
function broadcast(data: any) {
  const message = JSON.stringify(data);
  wsConnections.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Add CORS support
    verifyClient: (info, callback) => {
      // Accept all connections
      callback(true);
    }
  });
  
  console.log('WebSocket server set up at /ws path');
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    wsConnections.push(ws);
    
    // Send a welcome message to confirm connection
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to WebSocket server' }));
    
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
      try {
        const data = JSON.parse(message.toString());
        // Process message based on type
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      wsConnections = wsConnections.filter(conn => conn !== ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // API Routes
  
  // Tweets
  app.get('/api/tweets', async (req: Request, res: Response) => {
    try {
      const coinTag = req.query.coinTag as string | undefined;
      const tweets = coinTag 
        ? await storage.getTweetsByCoin(coinTag)
        : await storage.getLatestTweets(50);
      res.json(tweets);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // Manually trigger tweet fetch and analysis (for demo)
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      // Fetch tweets from Twitter-like service
      const fetchedTweets = await fetchTweets();
      
      // Process each tweet
      for (const tweet of fetchedTweets) {
        if (!tweet.tweetId || !tweet.content || !tweet.authorName || !tweet.coinSymbol || !tweet.createdAt) {
          console.warn('Skipping invalid tweet:', tweet);
          continue;
        }

        // Check if tweet already exists
        const existingTweets = await storage.getTweetsByCoin(tweet.coinSymbol);
        if (existingTweets.some((t: Tweet) => t.tweetId === tweet.tweetId)) continue;
        
        // Analyze sentiment
        const sentimentResult = await analyzeSentiment(tweet.content);
        const sentiment = typeof sentimentResult === 'number' ? sentimentResult : sentimentResult.score;
        
        // Store tweet with sentiment analysis
        const newTweet = await storage.createTweet({
          tweetId: tweet.tweetId,
          content: tweet.content,
          author: tweet.authorName,
          coinTag: tweet.coinSymbol,
          sentiment,
          createdAt: tweet.createdAt
        });
        
        // Broadcast new tweet to connected clients
        broadcast({
          type: 'new_tweet',
          tweetId: newTweet.tweetId,
          coinTag: newTweet.coinTag,
          sentiment: newTweet.sentiment
        });
        
        // Check if auto-trading is enabled
        const config = await storage.getConfig();
        if (config.autoTrading) {
          // Get coin details
          const coin = await storage.getCoinBySymbol(tweet.coinSymbol);
          if (!coin || !coin.isTracked) continue;
          
          // Execute trade based on sentiment
          const tradeResult = await executeTrade(
            coin,
            newTweet.sentiment,
            config.buyThreshold,
            config.sellThreshold
          );
          
          if (tradeResult) {
            // Broadcast trade to connected clients
            broadcast({
              type: 'new_trade',
              trade: {
                coinId: tradeResult.coinSymbol,
                type: tradeResult.type,
                amount: tradeResult.amount,
                price: tradeResult.price,
                timestamp: tradeResult.timestamp
              }
            });
          }
        }
      }
      
      // Update overall sentiment
      await updateOverallSentiment();
      
      res.json({ 
        success: true, 
        message: `Analyzed ${fetchedTweets.length} tweets` 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // Coins
  app.get('/api/coins', async (req: Request, res: Response) => {
    try {
      const coins = await storage.getTrackedCoins();
      res.json(coins);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  app.post('/api/coins', async (req: Request, res: Response) => {
    try {
      // Extract and validate symbol
      const symbol = z.object({ symbol: z.string().min(1).max(10) }).parse(req.body).symbol;
      
      // Check if coin already exists
      const existingCoin = await storage.getCoinBySymbol(symbol);
      if (existingCoin) {
        return res.status(400).json({ 
          success: false, 
          error: `Coin with symbol ${symbol} already exists` 
        });
      }
      
      // Create a new coin with default values
      const newCoin = await storage.createCoin({
        name: symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase(),
        symbol: symbol.toUpperCase(),
        currentPrice: 0.0001,
        priceChangePercentage: 0,
        image: `https://cryptologos.cc/logos/${symbol.toLowerCase()}-${symbol.toLowerCase()}-logo.png`,
        isTracked: true
      });
      
      res.status(201).json({ success: true, data: newCoin });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  app.patch('/api/coins/:symbol', async (req: Request, res: Response) => {
    try {
      const symbol = req.params.symbol;
      
      // Validate the coin exists
      const coin = await storage.getCoinBySymbol(symbol);
      if (!coin) {
        return res.status(404).json({ success: false, error: `Coin with symbol ${symbol} not found` });
      }
      
      // Update the coin with provided data
      const updatedCoin = await storage.updateCoin(symbol, req.body);
      if (!updatedCoin) {
        return res.status(500).json({ success: false, error: 'Failed to update coin' });
      }
      
      res.json({ success: true, data: updatedCoin });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // Trades
  app.get('/api/trades', async (req: Request, res: Response) => {
    try {
      const trades = await storage.getLatestTrades(50);
      res.json(trades);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  app.post('/api/trades', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const tradeData = z.object({
        coinId: z.string(),
        type: z.enum(['BUY', 'SELL']),
        amount: z.number().positive()
      }).parse(req.body);
      
      // Get coin details
      const coin = await storage.getCoinBySymbol(tradeData.coinId);
      if (!coin) {
        return res.status(404).json({ 
          success: false, 
          error: `Coin with symbol ${tradeData.coinId} not found` 
        });
      }
      
      // Create trade
      const newTrade = await storage.createTrade({
        coinId: tradeData.coinId,
        type: tradeData.type,
        amount: tradeData.amount,
        price: coin.currentPrice,
        timestamp: new Date()
      });
      
      res.status(201).json({ success: true, data: newTrade });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // Config
  app.get('/api/config', async (req: Request, res: Response) => {
    try {
      const config = await storage.getConfig();
      res.json(config);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  app.patch('/api/config', async (req: Request, res: Response) => {
    try {
      const config = await storage.updateConfig(req.body);
      res.json(config);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // Stats
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  app.patch('/api/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.updateStats(req.body);
      res.json(stats);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // User info (dummy implementation, replace with real auth logic if needed)
  app.get('/api/user', (req: Request, res: Response) => {
    // If you have authentication, return user info here.
    // For now, just return a placeholder user or null.
    res.json({ user: null });
  });
  
  app.post('/api/register', async (req: Request, res: Response) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername?.(username);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Store the user in the database
      const newUser = await storage.createUser?.({
        username,
        password: hashedPassword,
        email,
        createdAt: new Date(),
      });
      if (!newUser) {
        return res.status(500).json({ error: "Failed to create user" });
      }
      res.status(201).json({ message: "User registered!", user: { username: newUser.username, email: newUser.email } });
    } catch (error) {
      res.status(500).json({ error: "Registration failed", details: error instanceof Error ? error.message : error });
    }
  });
  
  app.post('/api/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    try {
      const user = await storage.getUserByUsername?.(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        req.session.user = { username: user.username, email: user.email };
        return res.status(200).json({ message: "Login successful", user: { username: user.username, email: user.email } });
      }
      return res.status(401).json({ error: "Invalid username or password" });
    } catch (error) {
      res.status(500).json({ error: "Login failed", details: error instanceof Error ? error.message : error });
    }
  });
  
  // Helper function to update overall sentiment
  async function updateOverallSentiment() {
    try {
      const tweets = await storage.getLatestTweets(100);
      if (tweets.length === 0) return;
      
      const totalSentiment = tweets.reduce((sum: number, tweet: Tweet) => sum + tweet.sentiment, 0);
      const averageSentiment = totalSentiment / tweets.length;
      
      let sentimentLabel = 'Neutral';
      if (averageSentiment > 0.3) sentimentLabel = 'Positive';
      else if (averageSentiment < -0.3) sentimentLabel = 'Negative';
      
      await storage.updateStats({
        overallSentiment: averageSentiment,
        overallSentimentLabel: sentimentLabel,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating overall sentiment:', error);
    }
  }
  
  return httpServer;
}
