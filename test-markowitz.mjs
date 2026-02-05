/**
 * Test script for the Markowitz Optimizer implementation
 */

import { MarkowitzOptimizer } from '../src/utils/markowitzOptimizer.js';
import { calculateExpectedReturns, calculateCovarianceMatrix, generateSyntheticReturns } from '../src/utils/dataProcessor.js';

// Test data
const symbols = ['AAPL', 'MSFT', 'GOOGL'];
const testData = {
  'AAPL': generateSyntheticReturns(252, 'AAPL'),
  'MSFT': generateSyntheticReturns(252, 'MSFT'),
  'GOOGL': generateSyntheticReturns(252, 'GOOGL')
};

// Calculate inputs
const expectedReturns = calculateExpectedReturns(testData);
const covarianceMatrix = calculateCovarianceMatrix(testData);

console.log('Test Data Generated:');
console.log('Expected Returns:', expectedReturns.map(r => (r * 100).toFixed(2) + '%'));
console.log('Covariance Matrix (first row):', covarianceMatrix[0].map(v => v.toFixed(4)));

// Initialize optimizer
const optimizer = new MarkowitzOptimizer(0.02);

console.log('\n=== Testing Markowitz Optimization ===\n');

// Test 1: Maximum Sharpe Ratio
console.log('1. Maximum Sharpe Ratio Optimization:');
try {
  const maxSharpeResult = optimizer.optimizeMaxSharpe({
    symbols,
    expectedReturns,
    covarianceMatrix
  });
  
  console.log('   Weights:', maxSharpeResult.weights.map((w, i) => `${symbols[i]}: ${(w * 100).toFixed(1)}%`).join(', '));
  console.log('   Expected Return:', (maxSharpeResult.expectedReturn * 100).toFixed(2) + '%');
  console.log('   Volatility:', (maxSharpeResult.volatility * 100).toFixed(2) + '%');
  console.log('   Sharpe Ratio:', maxSharpeResult.sharpeRatio.toFixed(3));
  console.log('   ✓ Max Sharpe optimization completed successfully\n');
} catch (error) {
  console.log('   ✗ Max Sharpe optimization failed:', error.message);
}

// Test 2: Minimum Variance
console.log('2. Minimum Variance Optimization:');
try {
  const minVarResult = optimizer.optimizeMinVariance({
    symbols,
    expectedReturns,
    covarianceMatrix
  });
  
  console.log('   Weights:', minVarResult.weights.map((w, i) => `${symbols[i]}: ${(w * 100).toFixed(1)}%`).join(', '));
  console.log('   Expected Return:', (minVarResult.expectedReturn * 100).toFixed(2) + '%');
  console.log('   Volatility:', (minVarResult.volatility * 100).toFixed(2) + '%');
  console.log('   Sharpe Ratio:', minVarResult.sharpeRatio.toFixed(3));
  console.log('   ✓ Min Variance optimization completed successfully\n');
} catch (error) {
  console.log('   ✗ Min Variance optimization failed:', error.message);
}

// Test 3: Target Return
console.log('3. Target Return Optimization (12% target):');
try {
  const targetReturnResult = optimizer.optimizeForTargetReturn({
    symbols,
    expectedReturns,
    covarianceMatrix
  }, 0.12);
  
  console.log('   Weights:', targetReturnResult.weights.map((w, i) => `${symbols[i]}: ${(w * 100).toFixed(1)}%`).join(', '));
  console.log('   Expected Return:', (targetReturnResult.expectedReturn * 100).toFixed(2) + '%');
  console.log('   Volatility:', (targetReturnResult.volatility * 100).toFixed(2) + '%');
  console.log('   Sharpe Ratio:', targetReturnResult.sharpeRatio.toFixed(3));
  console.log('   ✓ Target Return optimization completed successfully\n');
} catch (error) {
  console.log('   ✗ Target Return optimization failed:', error.message);
}

console.log('=== All Tests Completed ===');