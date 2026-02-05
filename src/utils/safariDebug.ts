/**
 * Safari debugging utilities to help identify and fix compatibility issues
 */

export interface SafariDebugInfo {
  isSafari: boolean;
  safariVersion: number | null;
  supportsModernFeatures: boolean;
  hasTrackingPrevention: boolean;
  cookiesEnabled: boolean;
  localStorageEnabled: boolean;
  fetchSupported: boolean;
  corsSupported: boolean;
}

export function getSafariDebugInfo(): SafariDebugInfo {
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  
  let safariVersion: number | null = null;
  if (isSafari) {
    const match = userAgent.match(/Version\/(\d+)/);
    safariVersion = match ? parseInt(match[1]) : null;
  }

  // Check modern features support
  const supportsModernFeatures = !!(
    window.fetch &&
    window.Promise &&
    window.Object.assign &&
    Array.prototype.includes
  );

  // Check tracking prevention (approximate)
  const hasTrackingPrevention = isSafari && safariVersion && safariVersion >= 11;

  // Test local storage
  let localStorageEnabled = false;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    localStorageEnabled = true;
  } catch (e) {
    localStorageEnabled = false;
  }

  return {
    isSafari,
    safariVersion,
    supportsModernFeatures,
    hasTrackingPrevention,
    cookiesEnabled: navigator.cookieEnabled,
    localStorageEnabled,
    fetchSupported: typeof fetch !== 'undefined',
    corsSupported: 'withCredentials' in new XMLHttpRequest()
  };
}

export function logSafariDebugInfo(): void {
  const debugInfo = getSafariDebugInfo();
  
  console.group('🔍 Safari Debug Information');
  console.log('Browser Info:', {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    onLine: navigator.onLine
  });
  
  console.log('Safari Specific:', debugInfo);
  
  console.log('API Support:', {
    fetch: typeof fetch !== 'undefined',
    Promise: typeof Promise !== 'undefined',
    localStorage: debugInfo.localStorageEnabled,
    sessionStorage: typeof sessionStorage !== 'undefined',
    WebSocket: typeof WebSocket !== 'undefined'
  });
  
  console.log('Network Info:', {
    connection: (navigator as any).connection || 'Not available',
    effectiveType: (navigator as any).connection?.effectiveType || 'Unknown'
  });
  
  console.groupEnd();
}

export function createSafariCompatibilityReport(): string {
  const debugInfo = getSafariDebugInfo();
  
  let report = '# Safari Compatibility Report\n\n';
  
  if (debugInfo.isSafari) {
    report += `✅ Safari detected (Version: ${debugInfo.safariVersion || 'Unknown'})\n\n`;
    
    if (debugInfo.safariVersion && debugInfo.safariVersion < 12) {
      report += '⚠️ **Warning**: Your Safari version is quite old. Consider updating for better compatibility.\n\n';
    }
    
    report += '## Feature Support:\n';
    report += `- Modern Features: ${debugInfo.supportsModernFeatures ? '✅' : '❌'}\n`;
    report += `- Fetch API: ${debugInfo.fetchSupported ? '✅' : '❌'}\n`;
    report += `- CORS: ${debugInfo.corsSupported ? '✅' : '❌'}\n`;
    report += `- Cookies: ${debugInfo.cookiesEnabled ? '✅' : '❌'}\n`;
    report += `- Local Storage: ${debugInfo.localStorageEnabled ? '✅' : '❌'}\n\n`;
    
    if (debugInfo.hasTrackingPrevention) {
      report += '## Tracking Prevention:\n';
      report += '⚠️ Safari\'s Intelligent Tracking Prevention (ITP) is likely active.\n';
      report += 'This may affect API calls and cross-site requests.\n\n';
      
      report += '### Recommendations:\n';
      report += '1. Ensure your API endpoints have proper CORS headers\n';
      report += '2. Avoid third-party cookies if possible\n';
      report += '3. Use same-site API calls when possible\n';
      report += '4. Consider using localStorage instead of cookies for client-side data\n\n';
    }
    
    if (!debugInfo.supportsModernFeatures) {
      report += '## Missing Features:\n';
      report += '❌ Some modern JavaScript features are not supported.\n';
      report += 'Consider adding polyfills or using a transpiled version.\n\n';
    }
  } else {
    report += '📱 Non-Safari browser detected\n\n';
  }
  
  return report;
}

// Test API connectivity specifically for Safari
export async function testAPIConnectivity(baseUrl: string): Promise<{
  success: boolean;
  error?: string;
  timing: number;
  details: any;
}> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${baseUrl}/api/stocks`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    const endTime = performance.now();
    const timing = endTime - startTime;
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        timing,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      timing,
      details: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        dataLength: data.length
      }
    };
    
  } catch (error) {
    const endTime = performance.now();
    const timing = endTime - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timing,
      details: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      }
    };
  }
}