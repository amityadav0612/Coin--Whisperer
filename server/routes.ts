import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { storage } from "./db/storage";
import { analyzeSentiment } from "./services/sentiment";
import { fetchTweets } from "./services/twitter";
import { executeTrade } from "./services/trading";
import {
  insertTweetSchema,
  insertCoinSchema,
  insertTradeSchema,
  insertConfigSchema,
  insertStatsSchema
} from "@shared/schema";

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
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    wsConnections.push(ws);
    
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
    });
    
    ws.on('close', () => {
      wsConnections = wsConnections.filter(conn => conn !== ws);
    });
  });
  
  // API Routes
  
  // Tweets
  app.get('/api/tweets', async (req: Request, res: Response) => {
    try {
      const coinSymbol = req.query.coinTag as string | undefined;
      const tweets = await storage.getTweets(50, coinSymbol);
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
        // Check if tweet already exists
        const existingTweet = await storage.getTweetByTwitterId(tweet.tweetId);
        if (existingTweet) continue;
        
        // Analyze sentiment
        const { score, label } = await analyzeSentiment(tweet.content);
        
        // Store tweet with sentiment analysis
        const newTweet = await storage.createTweet({
          ...tweet,
          sentimentScore: score,
          sentimentLabel: label
        });
        
        // Broadcast new tweet to connected clients
        broadcast({
          type: 'new_tweet',
          tweetId: newTweet.tweetId,
          coinSymbol: newTweet.coinSymbol,
          sentimentScore: newTweet.sentimentScore,
          sentimentLabel: newTweet.sentimentLabel
        });
        
        // Check if auto-trading is enabled
        const config = await storage.getConfig();
        if (config.autoTrading) {
          // Get coin details
          const coin = await storage.getCoinBySymbol(tweet.coinTag);
          if (!coin || !coin.isTracked) continue;
          
          // Execute trade based on sentiment
          const tradeResult = await executeTrade(
            coin,
            Number(newTweet.sentimentScore),
            Number(config.buyThreshold),
            Number(config.sellThreshold)
          );
          
          if (tradeResult) {
            // Broadcast trade to connected clients
            broadcast({
              type: 'new_trade',
              tradeId: tradeResult.id,
              coinSymbol: tradeResult.coinSymbol,
              tradeType: tradeResult.type,
              amount: tradeResult.amount,
              sentimentScore: tradeResult.sentimentScore
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
      const coins = await storage.getCoins();
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
  
  app.patch('/api/coins/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate the coin exists
      const coin = await storage.getCoin(id);
      if (!coin) {
        return res.status(404).json({ success: false, error: `Coin with ID ${id} not found` });
      }
      
      // Update the coin with provided data
      const updatedCoin = await storage.updateCoin(id, req.body);
      
      res.json({ success: true, data: updatedCoin });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // Trades
  app.get('/api/trades', async (req: Request, res: Response) => {
    try {
      const trades = await storage.getTrades();
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
        coinSymbol: z.string(),
        type: z.enum(['BUY', 'SELL']),
        amount: z.number().positive()
      }).parse(req.body);
      
      // Get coin details
      const coin = await storage.getCoinBySymbol(tradeData.coinSymbol);
      if (!coin) {
        return res.status(404).json({ 
          success: false, 
          error: `Coin with symbol ${tradeData.coinSymbol} not found` 
        });
      }
      
      // Get config for thresholds
      const config = await storage.getConfig();
      
      // Create a new trade
      const newTrade = await storage.createTrade({
        coinSymbol: tradeData.coinSymbol,
        type: tradeData.type,
        amount: tradeData.amount,
        price: Number(coin.currentPrice),
        sentimentScore: tradeData.type === 'BUY' ? 0.7 : 0.3, // Mock sentiment score
        threshold: tradeData.type === 'BUY' ? Number(config.buyThreshold) : Number(config.sellThreshold),
        timestamp: new Date()
      });
      
      // Broadcast trade to connected clients
      broadcast({
        type: 'new_trade',
        tradeId: newTrade.id,
        coinSymbol: newTrade.coinSymbol,
        tradeType: newTrade.type,
        amount: newTrade.amount,
        sentimentScore: newTrade.sentimentScore
      });
      
      res.status(201).json({ success: true, data: newTrade });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // Configuration
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
      // Validate request body
      const configData = insertConfigSchema.partial().parse(req.body);
      
      // Update config
      const updatedConfig = await storage.updateConfig(configData);
      
      res.json({ success: true, data: updatedConfig });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // Dashboard stats
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: message });
    }
  });
  
  // Helper function to update overall sentiment
  async function updateOverallSentiment() {
    try {
      // Get all tweets (limit to recent ones)
      const tweets = await storage.getTweets(100);
      
      if (tweets.length === 0) return;
      
      // Calculate average sentiment
      const totalSentiment = tweets.reduce((acc, tweet) => acc + Number(tweet.sentimentScore), 0);
      const averageSentiment = totalSentiment / tweets.length;
      
      // Determine sentiment label
      let sentimentLabel = "Neutral";
      if (averageSentiment >= 0.6) sentimentLabel = "Positive";
      else if (averageSentiment <= 0.4) sentimentLabel = "Negative";
      
      // Update stats
      await storage.updateStats({
        overallSentiment: averageSentiment,
        overallSentimentLabel: sentimentLabel
      });
    } catch (error) {
      console.error("Error updating overall sentiment:", error);
    }
  }
  
  return httpServer;
}
