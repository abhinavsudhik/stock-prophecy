import { Wallet, TrendingUp, Percent } from "lucide-react";
import { useState, useEffect } from "react";

const stats = [
	{
		title: "Total assets",
		value: "$ 87,743",
		icon: Wallet,
	},
	{
		title: "Total deposits",
		value: "$ 78,342",
		icon: TrendingUp,
	},
	{
		title: "APY",
		value: "+ 12.3%",
		icon: Percent,
		positive: true,
	},
];

// k-day simple moving average class
class MovingAverage {
	private window: number[] = [];
	private sum = 0;
	private k: number;

	constructor(k: number) {
		this.k = k;
	}

	next(price: number): number {
		this.window.push(price);
		this.sum += price;
		if (this.window.length > this.k) {
			this.sum -= this.window.shift()!;
		}
		return this.sum / this.window.length;
	}
}

// RSI calculation class
class RSI {
	private period: number;
	private gains: number[] = [];
	private losses: number[] = [];
	private previousPrice: number | null = null;

	constructor(period: number = 14) {
		this.period = period;
	}

	calculateRSI(prices: number[]): number {
		if (prices.length < this.period + 1) {
			return 50; // Return neutral RSI if not enough data
		}

		const gains: number[] = [];
		const losses: number[] = [];

		// Calculate gains and losses
		for (let i = 1; i < prices.length; i++) {
			const change = prices[i] - prices[i - 1];
			if (change > 0) {
				gains.push(change);
				losses.push(0);
			} else {
				gains.push(0);
				losses.push(Math.abs(change));
			}
		}

		// Calculate average gains and losses over the period
		const avgGain = gains.slice(-this.period).reduce((sum, gain) => sum + gain, 0) / this.period;
		const avgLoss = losses.slice(-this.period).reduce((sum, loss) => sum + loss, 0) / this.period;

		// Avoid division by zero
		if (avgLoss === 0) {
			return 100;
		}

		const rs = avgGain / avgLoss;
		const rsi = 100 - (100 / (1 + rs));

		return rsi;
	}
}

interface MovingAverageData {
	currentPrice: number;
	ma5: number;
	ma20: number;
	ma50: number;
	trend: 'bullish' | 'bearish' | 'neutral';
	stockSymbol: string;
}

interface HighLowData {
	currentPrice: number;
	highest5Day: number;
	lowest5Day: number;
	highest20Day: number;
	lowest20Day: number;
	status: 'overbought' | 'undervalued' | 'neutral';
	stockSymbol: string;
}

interface RSIData {
	currentPrice: number;
	rsi: number;
	status: 'overbought' | 'oversold' | 'neutral';
	stockSymbol: string;
}

export function PortfolioOverview({ 
	dailyChange,
	selectedStock,
	onAnalysisDataChange
}: { 
	dailyChange: number | null;
	selectedStock: string | null;
	onAnalysisDataChange?: (
		movingAvgData: MovingAverageData | null,
		rsiData: RSIData | null,
		highLowData: HighLowData | null
	) => void;
}) {
	const [movingAverageData, setMovingAverageData] = useState<MovingAverageData | null>(null);
	const [highLowData, setHighLowData] = useState<HighLowData | null>(null);
	const [rsiData, setRsiData] = useState<RSIData | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!selectedStock) {
			setMovingAverageData(null);
			setHighLowData(null);
			setRsiData(null);
			return;
		}

		const fetchStockAnalysisData = async () => {
			setLoading(true);
			try {
				// Fetch recent data for calculations
				const response = await fetch(`/api/stock-data?symbol=${selectedStock}&period=3M`);
				const data = await response.json();
				
				if (data && data.length > 0) {
					const prices = data.map((item: any) => item.close);
					const currentPrice = prices[prices.length - 1];
					
					// Calculate moving averages
					const ma5Calculator = new MovingAverage(5);
					const ma20Calculator = new MovingAverage(20);
					const ma50Calculator = new MovingAverage(50);
					
					let ma5 = 0, ma20 = 0, ma50 = 0;
					
					prices.forEach((price: number) => {
						ma5 = ma5Calculator.next(price);
						ma20 = ma20Calculator.next(price);
						ma50 = ma50Calculator.next(price);
					});
					
					// Determine trend
					let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
					if (currentPrice > ma5 && ma5 > ma20) {
						trend = 'bullish';
					} else if (currentPrice < ma5 && ma5 < ma20) {
						trend = 'bearish';
					}
					
					setMovingAverageData({
						currentPrice,
						ma5,
						ma20,
						ma50,
						trend,
						stockSymbol: selectedStock
					});

					// Calculate high/low data
					const last5Days = prices.slice(-5);
					const last20Days = prices.slice(-20);
					
					const highest5Day = Math.max(...last5Days);
					const lowest5Day = Math.min(...last5Days);
					const highest20Day = Math.max(...last20Days);
					const lowest20Day = Math.min(...last20Days);
					
					// Determine status based on current price relative to highs/lows
					let status: 'overbought' | 'undervalued' | 'neutral' = 'neutral';
					const priceRatio5Day = (currentPrice - lowest5Day) / (highest5Day - lowest5Day);
					
					if (priceRatio5Day > 0.8) {
						status = 'overbought'; // Near 5-day high
					} else if (priceRatio5Day < 0.2) {
						status = 'undervalued'; // Near 5-day low
					}
					
					setHighLowData({
						currentPrice,
						highest5Day,
						lowest5Day,
						highest20Day,
						lowest20Day,
						status,
						stockSymbol: selectedStock
					});

					// Calculate RSI
					const rsiCalculator = new RSI(14);
					const rsiValue = rsiCalculator.calculateRSI(prices);
					
					// Determine RSI status
					let rsiStatus: 'overbought' | 'oversold' | 'neutral' = 'neutral';
					if (rsiValue > 70) {
						rsiStatus = 'overbought';
					} else if (rsiValue < 30) {
						rsiStatus = 'oversold';
					}

					setRsiData({
						currentPrice,
						rsi: rsiValue,
						status: rsiStatus,
						stockSymbol: selectedStock
					});
				}
			} catch (error) {
				console.error('Error fetching stock analysis data:', error);
				setMovingAverageData(null);
				setHighLowData(null);
				setRsiData(null);
			}
			setLoading(false);
		};

		fetchStockAnalysisData();
	}, [selectedStock]);

	// Call callback whenever analysis data changes
	useEffect(() => {
		if (onAnalysisDataChange) {
			onAnalysisDataChange(movingAverageData, rsiData, highLowData);
		}
	}, [movingAverageData, rsiData, highLowData, onAnalysisDataChange]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-crypto transition-smooth">
				{!selectedStock ? (
					<div className="text-center py-8">
						<TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Moving Average Analysis</h3>
						<p className="text-sm text-muted-foreground">Select a stock from the sidebar to view moving average trends</p>
					</div>
				) : loading ? (
					<div className="text-center py-8">
						<TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
						<p className="text-sm text-muted-foreground">Calculating moving averages...</p>
					</div>
				) : movingAverageData ? (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Moving Average Analysis</h3>
							<div className={`px-3 py-1 rounded-full text-xs font-medium ${
								movingAverageData.trend === 'bullish' ? 'bg-green-100 text-green-800' :
								movingAverageData.trend === 'bearish' ? 'bg-red-100 text-red-800' :
								'bg-gray-100 text-gray-800'
							}`}>
								{movingAverageData.trend.toUpperCase()}
							</div>
						</div>
						
						<div className="text-sm text-muted-foreground mb-3">
							{movingAverageData.stockSymbol}
						</div>
						
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Current Price:</span>
								<span className="font-semibold text-foreground">${movingAverageData.currentPrice.toFixed(2)}</span>
							</div>
							
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">5-Day MA:</span>
									<span className={`font-medium ${
										movingAverageData.currentPrice > movingAverageData.ma5 ? 'text-green-600' : 'text-red-600'
									}`}>
										${movingAverageData.ma5.toFixed(2)}
									</span>
								</div>
								
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">20-Day MA:</span>
									<span className={`font-medium ${
										movingAverageData.currentPrice > movingAverageData.ma20 ? 'text-green-600' : 'text-red-600'
									}`}>
										${movingAverageData.ma20.toFixed(2)}
									</span>
								</div>
								
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">50-Day MA:</span>
									<span className={`font-medium ${
										movingAverageData.currentPrice > movingAverageData.ma50 ? 'text-green-600' : 'text-red-600'
									}`}>
										${movingAverageData.ma50.toFixed(2)}
									</span>
								</div>
							</div>
							
							<div className="mt-4 p-3 bg-muted/50 rounded-lg">
								<p className="text-xs text-muted-foreground">
									{movingAverageData.trend === 'bullish' && '📈 Price is above moving averages - Strong upward momentum'}
									{movingAverageData.trend === 'bearish' && '📉 Price is below moving averages - Downward pressure'}
									{movingAverageData.trend === 'neutral' && '📊 Mixed signals - Sideways movement'}
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center py-8">
						<TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
						<p className="text-sm text-muted-foreground">Unable to fetch data for this stock</p>
					</div>
				)}
			</div>
			
			{/* High/Low Analysis Card - replacing "Total deposits" */}
			<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-crypto transition-smooth">
				{!selectedStock ? (
					<div className="text-center py-8">
						<TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">High/Low Analysis</h3>
						<p className="text-sm text-muted-foreground">Select a stock to view support & resistance levels</p>
					</div>
				) : loading ? (
					<div className="text-center py-8">
						<TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
						<p className="text-sm text-muted-foreground">Calculating highs and lows...</p>
					</div>
				) : highLowData ? (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">High/Low Analysis</h3>
							<div className={`px-3 py-1 rounded-full text-xs font-medium ${
								highLowData.status === 'overbought' ? 'bg-red-100 text-red-800' :
								highLowData.status === 'undervalued' ? 'bg-green-100 text-green-800' :
								'bg-gray-100 text-gray-800'
							}`}>
								{highLowData.status.toUpperCase()}
							</div>
						</div>
						
						<div className="text-sm text-muted-foreground mb-3">
							{highLowData.stockSymbol}
						</div>
						
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Current Price:</span>
								<span className="font-semibold text-foreground">${highLowData.currentPrice.toFixed(2)}</span>
							</div>
							
							<div className="border-t pt-3">
								<p className="text-sm font-medium text-muted-foreground mb-2">5-Day Range:</p>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">• High (Resistance):</span>
										<span className={`font-medium ${
											Math.abs(highLowData.currentPrice - highLowData.highest5Day) < 2 ? 'text-red-600' : 'text-foreground'
										}`}>
											${highLowData.highest5Day.toFixed(2)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">• Low (Support):</span>
										<span className={`font-medium ${
											Math.abs(highLowData.currentPrice - highLowData.lowest5Day) < 2 ? 'text-green-600' : 'text-foreground'
										}`}>
											${highLowData.lowest5Day.toFixed(2)}
										</span>
									</div>
								</div>
							</div>
							
							<div className="border-t pt-3">
								<p className="text-sm font-medium text-muted-foreground mb-2">20-Day Range:</p>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">• High:</span>
										<span className="font-medium text-foreground">${highLowData.highest20Day.toFixed(2)}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">• Low:</span>
										<span className="font-medium text-foreground">${highLowData.lowest20Day.toFixed(2)}</span>
									</div>
								</div>
							</div>
							
							<div className="mt-4 p-3 bg-muted/50 rounded-lg">
								<p className="text-xs text-muted-foreground">
									{highLowData.status === 'overbought' && '🔴 Price near 5-day high - May be overbought'}
									{highLowData.status === 'undervalued' && '🟢 Price near 5-day low - May be undervalued'}
									{highLowData.status === 'neutral' && '📊 Price in middle range - Watch for breakouts'}
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center py-8">
						<TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
						<p className="text-sm text-muted-foreground">Unable to fetch data for this stock</p>
					</div>
				)}
			</div>
			
			{/* RSI Analysis Card - replacing APY */}
			<div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-crypto transition-smooth">
				{!selectedStock ? (
					<div className="text-center py-8">
						<Percent className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">RSI Analysis</h3>
						<p className="text-sm text-muted-foreground">Select a stock to view Relative Strength Index</p>
					</div>
				) : loading ? (
					<div className="text-center py-8">
						<Percent className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
						<p className="text-sm text-muted-foreground">Calculating RSI...</p>
					</div>
				) : rsiData ? (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">RSI Analysis</h3>
							<div className={`px-3 py-1 rounded-full text-xs font-medium ${
								rsiData.status === 'overbought' ? 'bg-red-100 text-red-800' :
								rsiData.status === 'oversold' ? 'bg-green-100 text-green-800' :
								'bg-gray-100 text-gray-800'
							}`}>
								{rsiData.status === 'overbought' ? 'OVERBOUGHT 🔴' :
								 rsiData.status === 'oversold' ? 'OVERSOLD 🟢' :
								 'NEUTRAL ⚫️'}
							</div>
						</div>
						
						<div className="text-sm text-muted-foreground mb-3">
							{rsiData.stockSymbol}
						</div>
						
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Current Price:</span>
								<span className="font-semibold text-foreground">${rsiData.currentPrice.toFixed(2)}</span>
							</div>
							
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">14-Day RSI:</span>
								<span className={`font-bold text-xl ${
									rsiData.status === 'overbought' ? 'text-red-600' :
									rsiData.status === 'oversold' ? 'text-green-600' :
									'text-foreground'
								}`}>
									{rsiData.rsi.toFixed(1)}
								</span>
							</div>
							
							<div className="mt-4 p-3 bg-muted/50 rounded-lg">
								<p className="text-xs font-medium text-muted-foreground mb-1">Analysis:</p>
								<p className="text-xs text-muted-foreground">
									{rsiData.status === 'overbought' && 'Price is high, may be due for a downward correction.'}
									{rsiData.status === 'oversold' && 'Price is low, may be due for an upward correction.'}
									{rsiData.status === 'neutral' && 'No strong overbought or oversold signal.'}
								</p>
							</div>
							
							{/* RSI Scale Visualization */}
							<div className="mt-4">
								<div className="flex justify-between text-xs text-muted-foreground mb-1">
									<span>Oversold</span>
									<span>Neutral</span>
									<span>Overbought</span>
								</div>
								<div className="relative h-2 bg-gradient-to-r from-green-500 via-gray-400 to-red-500 rounded-full">
									<div 
										className="absolute w-3 h-3 bg-white border-2 border-gray-800 rounded-full transform -translate-y-0.5"
										style={{ left: `${Math.min(Math.max(rsiData.rsi, 0), 100)}%`, transform: 'translateX(-50%) translateY(-25%)' }}
									></div>
								</div>
								<div className="flex justify-between text-xs text-muted-foreground mt-1">
									<span>0</span>
									<span>30</span>
									<span>70</span>
									<span>100</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="text-center py-8">
						<Percent className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
						<p className="text-sm text-muted-foreground">Unable to fetch data for this stock</p>
					</div>
				)}
			</div>
		</div>
	);
}