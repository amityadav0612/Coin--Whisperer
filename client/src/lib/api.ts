import { apiRequest } from "./queryClient";
import type {
  Tweet,
  Coin,
  Trade,
  Config,
  Stats,
  InsertConfig,
  ApiResponse
} from "@shared/schema";

// API endpoints
export const API = {
  // Tweets
  getTweets: async (coinTag?: string): Promise<Tweet[]> => {
    const url = coinTag 
      ? `/api/tweets?coinTag=${encodeURIComponent(coinTag)}`
      : '/api/tweets';
    const res = await apiRequest('GET', url);
    return await res.json();
  },
  
  // Coins
  getCoins: async (): Promise<Coin[]> => {
    const res = await apiRequest('GET', '/api/coins');
    return await res.json();
  },
  
  addCoin: async (symbol: string): Promise<ApiResponse<Coin>> => {
    const res = await apiRequest('POST', '/api/coins', { symbol });
    return await res.json();
  },
  
  toggleCoinTracking: async (id: number, isTracked: boolean): Promise<ApiResponse<Coin>> => {
    const res = await apiRequest('PATCH', `/api/coins/${id}`, { isTracked });
    return await res.json();
  },
  
  // Trades
  getTrades: async (): Promise<Trade[]> => {
    const res = await apiRequest('GET', '/api/trades');
    return await res.json();
  },
  
  executeTrade: async (coinSymbol: string, type: 'BUY' | 'SELL', amount: number): Promise<ApiResponse<Trade>> => {
    const res = await apiRequest('POST', '/api/trades', { coinSymbol, type, amount });
    return await res.json();
  },
  
  // Configuration
  getConfig: async (): Promise<Config> => {
    const res = await apiRequest('GET', '/api/config');
    return await res.json();
  },
  
  updateConfig: async (config: Partial<InsertConfig>): Promise<ApiResponse<Config>> => {
    const res = await apiRequest('PATCH', '/api/config', config);
    return await res.json();
  },
  
  // Dashboard Stats
  getStats: async (): Promise<Stats> => {
    const res = await apiRequest('GET', '/api/stats');
    return await res.json();
  },
  
  // Analysis
  analyzeTweets: async (): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiRequest('POST', '/api/analyze');
    return await res.json();
  }
};
