import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBDdH33VrTnBVkq-v2_MNycCm7cuACvxY8";
const genAI = new GoogleGenerativeAI(API_KEY);

// Helper function to extract JSON from potentially markdown-wrapped responses
function extractJSON(text: string): string {
  let cleanedText = text.trim();
  
  // Remove markdown code blocks if present
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  // Look for JSON object within the text if it's wrapped in other content
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanedText = jsonMatch[0];
  }
  
  return cleanedText.trim();
}

export interface PredictionData {
  date: string;
  predictedClose: number;
  confidence: number;
}

export interface StockDataPoint {
  date: string;
  close: number;
  high?: number;
  low?: number;
  open?: number;
  volume?: number;
}

export async function generateStockPrediction(
  stockSymbol: string,
  historicalData: StockDataPoint[]
): Promise<PredictionData[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the data for analysis
    const recentData = historicalData.slice(-30); // Last 30 days
    const currentPrice = recentData[recentData.length - 1]?.close;
    const lastDate = new Date(recentData[recentData.length - 1]?.date);
    
    if (!currentPrice || !lastDate) {
      throw new Error("No current price data available");
    }

    // Create dates for the next 7 days starting from the day after the last historical date
    const predictionDates: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);
      predictionDates.push(nextDate.toISOString().split('T')[0]);
    }

    // Create a prompt for stock prediction
    const prompt = `
You are a financial analyst AI. Based on the following historical stock data for ${stockSymbol}, predict the next 7 days of stock prices.

Historical Data (last 30 days):
${recentData.map(d => `Date: ${d.date}, Close: $${d.close.toFixed(2)}`).join('\n')}

Current Price: $${currentPrice.toFixed(2)}
Last Trading Date: ${lastDate.toISOString().split('T')[0]}

Please provide predictions for the next 7 trading days starting from ${predictionDates[0]} in the following JSON format only (no additional text):
{
  "predictions": [
    ${predictionDates.map((date, i) => `{
      "date": "${date}",
      "predictedClose": number,
      "confidence": number (0-1)
    }`).join(',\n    ')}
  ]
}

Consider:
- Recent price trends and patterns
- Technical indicators and momentum
- Market volatility
- Provide realistic predictions with confidence scores
- Confidence should be between 0.1 and 0.8 (financial predictions are inherently uncertain)
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response - handle markdown code blocks
    let cleanedText = text.trim();
    try {
      // Extract clean JSON from the response
      cleanedText = extractJSON(text);
      
      console.log('Original Gemini response:', text.substring(0, 200) + '...');
      console.log('Extracted JSON:', cleanedText);
      
      const parsed = JSON.parse(cleanedText);
      const predictions = parsed.predictions || [];
      
      // Validate and format predictions with correct dates
      const formattedPredictions: PredictionData[] = predictions.map((pred: any, index: number) => {
        return {
          date: predictionDates[index],
          predictedClose: typeof pred.predictedClose === 'number' ? pred.predictedClose : currentPrice,
          confidence: typeof pred.confidence === 'number' ? Math.max(0.1, Math.min(0.8, pred.confidence)) : 0.5
        };
      });

      return formattedPredictions.slice(0, 7); // Ensure only 7 days
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response text (first 500 chars):", text.substring(0, 500));
      console.error("Extracted JSON attempt:", cleanedText);
      
      // Fallback: Generate basic predictions based on recent trend
      return generateFallbackPredictions(stockSymbol, recentData, predictionDates);
    }
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Fallback: Generate basic predictions based on recent trend
    const lastDate = new Date(historicalData[historicalData.length - 1]?.date);
    const predictionDates: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);
      predictionDates.push(nextDate.toISOString().split('T')[0]);
    }
    return generateFallbackPredictions(stockSymbol, historicalData.slice(-30), predictionDates);
  }
}

function generateFallbackPredictions(
  stockSymbol: string, 
  recentData: StockDataPoint[],
  predictionDates?: string[]
): PredictionData[] {
  if (recentData.length < 2) {
    return [];
  }

  const currentPrice = recentData[recentData.length - 1].close;
  const previousPrice = recentData[recentData.length - 2].close;
  const dailyChange = (currentPrice - previousPrice) / previousPrice;
  const lastDate = new Date(recentData[recentData.length - 1].date);
  
  // Calculate average volatility from recent data
  const volatility = calculateVolatility(recentData);
  
  const predictions: PredictionData[] = [];
  
  // Use provided dates or generate them
  const dates = predictionDates || [];
  if (dates.length === 0) {
    for (let i = 1; i <= 7; i++) {
      const predictionDate = new Date(lastDate);
      predictionDate.setDate(lastDate.getDate() + i);
      dates.push(predictionDate.toISOString().split('T')[0]);
    }
  }
  
  for (let i = 0; i < Math.min(7, dates.length); i++) {
    // Simple trend-following with some randomness
    const trendFactor = Math.pow(0.8, i + 1); // Decay the trend over time
    const randomFactor = (Math.random() - 0.5) * volatility * 0.5;
    const predictedChange = dailyChange * trendFactor + randomFactor;
    
    const predictedPrice = currentPrice * (1 + predictedChange * (i + 1) * 0.3);
    
    predictions.push({
      date: dates[i],
      predictedClose: Math.max(0.01, predictedPrice), // Ensure positive price
      confidence: Math.max(0.1, 0.6 - (i + 1) * 0.05) // Decreasing confidence over time
    });
  }
  
  return predictions;
}

function calculateVolatility(data: StockDataPoint[]): number {
  if (data.length < 2) return 0.02; // Default 2% volatility
  
  const returns = [];
  for (let i = 1; i < data.length; i++) {
    const dailyReturn = (data[i].close - data[i-1].close) / data[i-1].close;
    returns.push(dailyReturn);
  }
  
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance);
}