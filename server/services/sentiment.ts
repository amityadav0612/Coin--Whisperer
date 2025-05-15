// Simple sentiment analysis service

interface SentimentResult {
  score: number;  // 0 to 1, where 0 is negative and 1 is positive
  label: string;  // "Positive", "Negative", or "Neutral"
}

// List of positive keywords for simple sentiment analysis
const positiveWords = [
  'bullish', 'moon', 'gains', 'profit', 'up', 'rising', 'soar', 'skyrocket',
  'great', 'good', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful',
  'incredible', 'potential', 'opportunity', 'strong', 'growth', 'buy', 'hodl',
  'hold', 'diamond hands', 'green', 'rally', 'support', 'success', 'winning',
  'breakthrough', 'surge', 'rocket', '🚀', '💎', '👍', '💪', '🔥', '💰'
];

// List of negative keywords for simple sentiment analysis
const negativeWords = [
  'bearish', 'crash', 'dump', 'fall', 'drop', 'plummet', 'collapse', 'tank',
  'bad', 'terrible', 'horrible', 'awful', 'disappointing', 'weak', 'sell',
  'selling', 'sold', 'scam', 'fraud', 'fake', 'ponzi', 'bubble', 'fear',
  'worried', 'worry', 'concern', 'red', 'loss', 'losing', 'fail', 'failure',
  'down', 'bearish', 'bear', 'death', 'broke', 'worthless', '👎', '😱', '💩'
];

/**
 * Analyze sentiment of a text string
 * This is a very simple implementation for demo purposes
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const lowerText = text.toLowerCase();
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    if (lowerText.includes(word.toLowerCase())) {
      positiveCount++;
    }
  }
  
  for (const word of negativeWords) {
    if (lowerText.includes(word.toLowerCase())) {
      negativeCount++;
    }
  }
  
  // Calculate sentiment score (0 to 1)
  const totalWords = positiveCount + negativeCount;
  
  // If no sentiment words found, return neutral
  if (totalWords === 0) {
    return { score: 0.5, label: "Neutral" };
  }
  
  const score = positiveCount / totalWords;
  
  // Determine sentiment label
  let label = "Neutral";
  if (score >= 0.6) label = "Positive";
  else if (score <= 0.4) label = "Negative";
  
  return { score, label };
}
