import { z } from "zod";

// User Schema
export const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  createdAt: z.date().default(() => new Date())
});

// Tweet Schema
export const tweetSchema = z.object({
  tweetId: z.string(),
  content: z.string(),
  author: z.string(),
  coinTag: z.string(),
  sentiment: z.number(),
  createdAt: z.date().default(() => new Date())
});

// Coin Schema
export const coinSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  currentPrice: z.number(),
  priceChangePercentage: z.number(),
  image: z.string(),
  isTracked: z.boolean().default(true)
});

// Trade Schema
export const tradeSchema = z.object({
  coinId: z.string(),
  type: z.enum(["BUY", "SELL"]),
  amount: z.number(),
  price: z.number(),
  timestamp: z.date().default(() => new Date())
});

// Config Schema
export const configSchema = z.object({
  buyThreshold: z.number().default(0.3),
  sellThreshold: z.number().default(-0.3),
  autoTrading: z.boolean().default(false),
  notifications: z.boolean().default(true),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM")
});

// Stats Schema
export const statsSchema = z.object({
  overallSentiment: z.number().default(0),
  overallSentimentLabel: z.string().default("Neutral"),
  activeTrades: z.number().default(0),
  profitLoss: z.number().default(0),
  profitLossPercentage: z.number().default(0),
  trackedCoins: z.number().default(0),
  lastUpdated: z.date().default(() => new Date())
});

// Insert schemas (for creating new records)
export const insertUserSchema = userSchema.omit({ createdAt: true });
export const insertTweetSchema = tweetSchema.omit({ createdAt: true });
export const insertCoinSchema = coinSchema;
export const insertTradeSchema = tradeSchema.omit({ timestamp: true });
export const insertConfigSchema = configSchema;
export const insertStatsSchema = statsSchema.omit({ lastUpdated: true });

// Types for frontend
export type User = z.infer<typeof userSchema>;
export type Tweet = z.infer<typeof tweetSchema>;
export type Coin = z.infer<typeof coinSchema>;
export type Trade = z.infer<typeof tradeSchema>;
export type Config = z.infer<typeof configSchema>;
export type Stats = z.infer<typeof statsSchema>;

// Types for backend
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTweet = z.infer<typeof insertTweetSchema>;
export type InsertCoin = z.infer<typeof insertCoinSchema>;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type InsertConfig = z.infer<typeof insertConfigSchema>;
export type InsertStats = z.infer<typeof insertStatsSchema>;

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
