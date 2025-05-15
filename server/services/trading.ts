import { storage } from "../storage";
import type { Coin, InsertTrade, Trade } from "@shared/schema";

/**
 * Execute a trade based on sentiment analysis
 * 
 * @param coin The coin to trade
 * @param sentimentScore The sentiment score (0-1)
 * @param buyThreshold The threshold for buying
 * @param sellThreshold The threshold for selling
 * @returns The executed trade or null if no trade was executed
 */
export async function executeTrade(
  coin: Coin,
  sentimentScore: number,
  buyThreshold: number,
  sellThreshold: number
): Promise<Trade | null> {
  // Determine if we should make a trade
  let tradeType: 'BUY' | 'SELL' | null = null;
  
  if (sentimentScore >= buyThreshold) {
    tradeType = 'BUY';
  } else if (sentimentScore <= sellThreshold) {
    tradeType = 'SELL';
  }
  
  // If no trade should be made, return null
  if (!tradeType) return null;
  
  // Calculate trade amount based on sentiment strength and coin price
  // This is a simple demo calculation
  const baseAmount = 100; // $100 base trade
  const sentimentMultiplier = tradeType === 'BUY' 
    ? sentimentScore
    : (1 - sentimentScore);
  
  const tradeAmount = baseAmount * sentimentMultiplier;
  
  // Create the trade
  const trade: InsertTrade = {
    type: tradeType,
    coinSymbol: coin.symbol,
    amount: tradeAmount,
    price: Number(coin.currentPrice),
    sentimentScore: sentimentScore,
    threshold: tradeType === 'BUY' ? buyThreshold : sellThreshold,
    timestamp: new Date()
  };
  
  // Store the trade
  return await storage.createTrade(trade);
}
