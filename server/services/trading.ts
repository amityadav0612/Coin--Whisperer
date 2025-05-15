import { storage } from "../db/storage";
import type { ICoin, ITrade } from "../db/models";

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
  coin: ICoin,
  sentimentScore: number,
  buyThreshold: number,
  sellThreshold: number
): Promise<ITrade | null> {
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
  const tradeData = {
    type: tradeType,
    coinSymbol: coin.symbol,
    amount: tradeAmount,
    price: coin.currentPrice,
    sentimentScore: sentimentScore,
    threshold: tradeType === 'BUY' ? buyThreshold : sellThreshold,
    timestamp: new Date()
  };
  
  // Store the trade
  return await storage.createTrade(tradeData);
}
