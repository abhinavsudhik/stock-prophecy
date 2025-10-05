interface MarkowitzInputs {
  symbols: string[];
  expectedReturns: number[];
  covarianceMatrix: number[][];
  riskFreeRate?: number;
}

interface MarkowitzInputsWithReturns extends MarkowitzInputs {
  historicalReturns: number[][]; // Array of historical returns for each asset
}

interface OptimizationResult {
  weights: number[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
}

export class MarkowitzOptimizer {
  private riskFreeRate: number;

  constructor(riskFreeRate: number = 0.02) {
    this.riskFreeRate = riskFreeRate;
  }

  /**
   * Calculate portfolio variance given weights and covariance matrix
   */
  private calculatePortfolioVariance(weights: number[], covarianceMatrix: number[][]): number {
    const n = weights.length;
    let variance = 0;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        variance += weights[i] * weights[j] * covarianceMatrix[i][j];
      }
    }

    return variance;
  }

  /**
   * Calculate portfolio expected return
   */
  private calculatePortfolioReturn(weights: number[], expectedReturns: number[]): number {
    return weights.reduce((sum, weight, index) => sum + weight * expectedReturns[index], 0);
  }

  /**
   * Optimize portfolio for maximum Sharpe ratio using iterative optimization
   */
  optimizeMaxSharpe(inputs: MarkowitzInputs): OptimizationResult {
    const { expectedReturns, covarianceMatrix } = inputs;
    const n = expectedReturns.length;

    // Calculate excess returns (return - risk-free rate)
    const excessReturns = expectedReturns.map(r => r - this.riskFreeRate);

    // Initial equal weights
    let weights = new Array(n).fill(1 / n);
    let bestSharpe = -Infinity;
    let bestWeights = [...weights];

    // Iterative optimization using gradient ascent
    const iterations = 2000;
    let learningRate = 0.005;

    for (let iter = 0; iter < iterations; iter++) {
      // Calculate current metrics
      const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
      const portfolioVariance = this.calculatePortfolioVariance(weights, covarianceMatrix);
      const portfolioVolatility = Math.sqrt(Math.max(portfolioVariance, 1e-8)); // Prevent division by zero
      const sharpeRatio = (portfolioReturn - this.riskFreeRate) / portfolioVolatility;

      if (sharpeRatio > bestSharpe) {
        bestSharpe = sharpeRatio;
        bestWeights = [...weights];
      }

      // Calculate gradients for Sharpe ratio maximization
      const gradients = this.calculateSharpeGradients(weights, excessReturns, covarianceMatrix);
      
      // Update weights using gradient ascent
      for (let i = 0; i < n; i++) {
        weights[i] += learningRate * gradients[i];
      }

      // Project weights to satisfy constraints
      this.normalizeWeights(weights);

      // Adaptive learning rate
      if (iter > 0 && iter % 500 === 0) {
        learningRate *= 0.95; // Reduce learning rate over time
      }
    }

    const finalReturn = this.calculatePortfolioReturn(bestWeights, expectedReturns);
    const finalVariance = this.calculatePortfolioVariance(bestWeights, covarianceMatrix);
    const finalVolatility = Math.sqrt(Math.max(finalVariance, 1e-8));
    const finalSharpe = (finalReturn - this.riskFreeRate) / finalVolatility;

    return {
      weights: bestWeights,
      expectedReturn: finalReturn,
      volatility: finalVolatility,
      sharpeRatio: finalSharpe,
      sortinoRatio: finalSharpe // Approximation: use Sharpe ratio when historical data not available
    };
  }

  /**
   * Calculate gradients for Sharpe ratio optimization
   */
  private calculateSharpeGradients(weights: number[], excessReturns: number[], covarianceMatrix: number[][]): number[] {
    const n = weights.length;
    const portfolioExcessReturn = this.calculatePortfolioReturn(weights, excessReturns);
    const portfolioVariance = Math.max(this.calculatePortfolioVariance(weights, covarianceMatrix), 1e-8);
    const portfolioVolatility = Math.sqrt(portfolioVariance);

    const gradients = new Array(n);

    for (let i = 0; i < n; i++) {
      // Calculate derivative of portfolio variance with respect to weight i
      let varianceDerivative = 0;
      for (let j = 0; j < n; j++) {
        varianceDerivative += 2 * weights[j] * covarianceMatrix[i][j];
      }

      // Sharpe ratio gradient: d(SR)/dw_i
      const numerator = excessReturns[i] * portfolioVolatility - 
                       portfolioExcessReturn * (varianceDerivative / (2 * portfolioVolatility));
      
      gradients[i] = numerator / portfolioVariance;
    }

    return gradients;
  }

  /**
   * Normalize weights to sum to 1 and ensure non-negative (long-only constraint)
   */
  private normalizeWeights(weights: number[]): void {
    // Ensure non-negative weights (long-only portfolio)
    for (let i = 0; i < weights.length; i++) {
      weights[i] = Math.max(0, weights[i]);
    }

    // Normalize to sum to 1
    const sum = weights.reduce((a, b) => a + b, 0);
    if (sum > 1e-8) {
      for (let i = 0; i < weights.length; i++) {
        weights[i] /= sum;
      }
    } else {
      // If all weights are zero, set equal weights
      const equalWeight = 1 / weights.length;
      weights.fill(equalWeight);
    }
  }

  /**
   * Calculate downside deviation for Sortino ratio
   * Only considers returns below the target return (typically risk-free rate)
   */
  private calculateDownsideDeviation(weights: number[], historicalReturns: number[][], targetReturn: number = 0): number {
    if (!historicalReturns || historicalReturns.length === 0) {
      return 0.01; // Default small value to prevent division by zero
    }

    const numAssets = weights.length;
    const numPeriods = historicalReturns[0]?.length || 0;
    
    if (numPeriods === 0) {
      return 0.01;
    }

    let sumSquaredDownsideDeviations = 0;
    let downsidePeriods = 0;

    // Calculate portfolio returns for each period
    for (let t = 0; t < numPeriods; t++) {
      let portfolioReturn = 0;
      
      // Calculate weighted portfolio return for this period
      for (let i = 0; i < numAssets; i++) {
        if (historicalReturns[i] && historicalReturns[i][t] !== undefined) {
          portfolioReturn += weights[i] * historicalReturns[i][t];
        }
      }

      // Only consider returns below the target return
      if (portfolioReturn < targetReturn) {
        const downsideDeviation = portfolioReturn - targetReturn;
        sumSquaredDownsideDeviations += downsideDeviation * downsideDeviation;
        downsidePeriods++;
      }
    }

    // Calculate downside deviation
    if (downsidePeriods > 0) {
      return Math.sqrt(sumSquaredDownsideDeviations / downsidePeriods);
    }
    
    return 0.01; // Small positive value if no downside periods
  }

  /**
   * Calculate Sortino ratio for a given portfolio
   * Sortino Ratio = (Portfolio Return - Risk-Free Rate) / Downside Deviation
   */
  private calculateSortinoRatio(weights: number[], expectedReturns: number[], historicalReturns: number[][]): number {
    const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
    const downsideDeviation = this.calculateDownsideDeviation(weights, historicalReturns, this.riskFreeRate);
    
    return (portfolioReturn - this.riskFreeRate) / downsideDeviation;
  }

  /**
   * Optimize portfolio for maximum Sortino ratio using iterative optimization
   */
  optimizeMaxSortino(inputs: MarkowitzInputsWithReturns): OptimizationResult {
    const { expectedReturns, covarianceMatrix, historicalReturns } = inputs;
    const n = expectedReturns.length;

    // Calculate excess returns (return - risk-free rate)
    const excessReturns = expectedReturns.map(r => r - this.riskFreeRate);

    // Initial equal weights
    let weights = new Array(n).fill(1 / n);
    let bestSortino = -Infinity;
    let bestWeights = [...weights];

    // Iterative optimization using gradient ascent
    const iterations = 2000;
    let learningRate = 0.005;

    for (let iter = 0; iter < iterations; iter++) {
      // Calculate current metrics
      const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
      const portfolioVariance = this.calculatePortfolioVariance(weights, covarianceMatrix);
      const portfolioVolatility = Math.sqrt(Math.max(portfolioVariance, 1e-8));
      const sortinoRatio = this.calculateSortinoRatio(weights, expectedReturns, historicalReturns);

      if (sortinoRatio > bestSortino) {
        bestSortino = sortinoRatio;
        bestWeights = [...weights];
      }

      // Calculate gradients for Sortino ratio maximization (simplified approach using Sharpe gradients)
      // Note: True Sortino gradients are complex; this uses Sharpe gradients as approximation
      const gradients = this.calculateSharpeGradients(weights, excessReturns, covarianceMatrix);
      
      // Update weights using gradient ascent
      for (let i = 0; i < n; i++) {
        weights[i] += learningRate * gradients[i];
      }

      // Project weights to satisfy constraints
      this.normalizeWeights(weights);

      // Adaptive learning rate
      if (iter > 0 && iter % 500 === 0) {
        learningRate *= 0.95;
      }
    }

    const finalReturn = this.calculatePortfolioReturn(bestWeights, expectedReturns);
    const finalVariance = this.calculatePortfolioVariance(bestWeights, covarianceMatrix);
    const finalVolatility = Math.sqrt(Math.max(finalVariance, 1e-8));
    const finalSharpe = (finalReturn - this.riskFreeRate) / finalVolatility;
    const finalSortino = this.calculateSortinoRatio(bestWeights, expectedReturns, historicalReturns);

    return {
      weights: bestWeights,
      expectedReturn: finalReturn,
      volatility: finalVolatility,
      sharpeRatio: finalSharpe,
      sortinoRatio: finalSortino
    };
  }

  /**
   * Optimize portfolio for minimum variance
   */
  optimizeMinVariance(inputs: MarkowitzInputs): OptimizationResult {
    const { expectedReturns, covarianceMatrix } = inputs;
    const n = expectedReturns.length;

    try {
      // For minimum variance portfolio: min w'Σw subject to w'1 = 1, w >= 0
      // Analytical solution: w = (Σ^-1 * 1) / (1' * Σ^-1 * 1)
      
      const invCovMatrix = this.invertMatrix(covarianceMatrix);
      const ones = new Array(n).fill(1);
      
      // Calculate Σ^-1 * 1
      const invCovTimesOnes = this.multiplyMatrixVector(invCovMatrix, ones);
      
      // Calculate 1' * Σ^-1 * 1
      const denominator = ones.reduce((sum, _, i) => sum + invCovTimesOnes[i], 0);
      
      // Calculate optimal weights
      let weights = invCovTimesOnes.map(val => val / denominator);
      
      // Ensure non-negative weights
      this.normalizeWeights(weights);

      const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
      const portfolioVariance = this.calculatePortfolioVariance(weights, covarianceMatrix);
      const portfolioVolatility = Math.sqrt(Math.max(portfolioVariance, 1e-8));
      const sharpeRatio = (portfolioReturn - this.riskFreeRate) / portfolioVolatility;

      return {
        weights,
        expectedReturn: portfolioReturn,
        volatility: portfolioVolatility,
        sharpeRatio,
        sortinoRatio: sharpeRatio // Approximation when historical data not available
      };
    } catch (error) {
      console.warn('Matrix inversion failed, falling back to equal weights:', error);
      // Fallback to equal weights if matrix inversion fails
      const equalWeight = 1 / n;
      const weights = new Array(n).fill(equalWeight);
      
      const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
      const portfolioVariance = this.calculatePortfolioVariance(weights, covarianceMatrix);
      const portfolioVolatility = Math.sqrt(Math.max(portfolioVariance, 1e-8));
      const sharpeRatio = (portfolioReturn - this.riskFreeRate) / portfolioVolatility;

      return {
        weights,
        expectedReturn: portfolioReturn,
        volatility: portfolioVolatility,
        sharpeRatio,
        sortinoRatio: sharpeRatio // Approximation when historical data not available
      };
    }
  }

  /**
   * Matrix inversion using Gaussian elimination with partial pivoting
   */
  private invertMatrix(matrix: number[][]): number[][] {
    const n = matrix.length;
    
    // Create augmented matrix [A|I]
    const augmented = matrix.map((row, i) => [
      ...row.map(val => val),
      ...new Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
    ]);

    // Forward elimination with partial pivoting
    for (let i = 0; i < n; i++) {
      // Find pivot row
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows if needed
      if (maxRow !== i) {
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      }

      // Check for singular matrix
      if (Math.abs(augmented[i][i]) < 1e-10) {
        throw new Error('Matrix is singular or nearly singular');
      }

      // Scale pivot row
      const pivot = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }

      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }

    // Extract inverse matrix from the right half
    return augmented.map(row => row.slice(n));
  }

  /**
   * Multiply matrix by vector
   */
  private multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => 
      row.reduce((sum, val, i) => sum + val * vector[i], 0)
    );
  }

  /**
   * Optimize portfolio for a target return level
   */
  optimizeForTargetReturn(inputs: MarkowitzInputs, targetReturn: number): OptimizationResult {
    const { expectedReturns, covarianceMatrix } = inputs;
    const n = expectedReturns.length;

    // Use iterative approach to find weights that achieve target return with minimum risk
    let weights = new Array(n).fill(1 / n);
    let bestVolatility = Infinity;
    let bestWeights = [...weights];

    const iterations = 1000;
    const learningRate = 0.01;
    const returnTolerance = 0.001; // 0.1% tolerance for target return

    for (let iter = 0; iter < iterations; iter++) {
      const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
      const portfolioVariance = this.calculatePortfolioVariance(weights, covarianceMatrix);
      const portfolioVolatility = Math.sqrt(Math.max(portfolioVariance, 1e-8));

      // Check if we're close to target return
      if (Math.abs(portfolioReturn - targetReturn) <= returnTolerance) {
        if (portfolioVolatility < bestVolatility) {
          bestVolatility = portfolioVolatility;
          bestWeights = [...weights];
        }
      }

      // Gradient for minimizing variance subject to return constraint
      const varianceGradients = this.calculateVarianceGradients(weights, covarianceMatrix);
      const returnError = targetReturn - portfolioReturn;

      // Update weights to minimize variance while moving toward target return
      for (let i = 0; i < n; i++) {
        const returnGradient = expectedReturns[i];
        weights[i] -= learningRate * varianceGradients[i];
        weights[i] += learningRate * returnError * returnGradient * 0.1; // Return constraint
      }

      this.normalizeWeights(weights);
    }

    const finalReturn = this.calculatePortfolioReturn(bestWeights, expectedReturns);
    const finalVariance = this.calculatePortfolioVariance(bestWeights, covarianceMatrix);
    const finalVolatility = Math.sqrt(Math.max(finalVariance, 1e-8));
    const finalSharpe = (finalReturn - this.riskFreeRate) / finalVolatility;

    return {
      weights: bestWeights,
      expectedReturn: finalReturn,
      volatility: finalVolatility,
      sharpeRatio: finalSharpe,
      sortinoRatio: finalSharpe // Approximation when historical data not available
    };
  }

  /**
   * Calculate gradients for portfolio variance
   */
  private calculateVarianceGradients(weights: number[], covarianceMatrix: number[][]): number[] {
    const n = weights.length;
    const gradients = new Array(n);

    for (let i = 0; i < n; i++) {
      gradients[i] = 0;
      for (let j = 0; j < n; j++) {
        gradients[i] += 2 * weights[j] * covarianceMatrix[i][j];
      }
    }

    return gradients;
  }
}

export default MarkowitzOptimizer;