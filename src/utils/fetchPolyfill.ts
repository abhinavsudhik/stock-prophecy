/**
 * Fetch polyfill and Safari compatibility utilities
 */

// Check if fetch is available and working properly
export function isFetchSupported(): boolean {
  return typeof fetch !== 'undefined' && 
         typeof window !== 'undefined' && 
         'Promise' in window;
}

// Enhanced fetch function with Safari compatibility
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (!isFetchSupported()) {
    throw new Error('Fetch is not supported in this browser');
  }

  // Default options for Safari compatibility
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-cache',
    ...options
  };

  // Merge headers properly
  defaultOptions.headers = {
    ...defaultOptions.headers,
    ...options.headers
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Additional Safari-specific checks
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
    }
    
    return response;
  } catch (error) {
    // Enhanced error handling for Safari
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new Error('Network error: Please check your internet connection and try again.');
    }
    
    if (error instanceof TypeError && error.message.includes('cors')) {
      throw new Error('CORS error: Unable to access the API. This might be due to browser security settings.');
    }
    
    throw error;
  }
}

// Check if the current browser is Safari
export function isSafari(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(userAgent);
}

// Get Safari version if applicable
export function getSafariVersion(): number | null {
  if (!isSafari()) return null;
  
  const userAgent = window.navigator.userAgent;
  const match = userAgent.match(/Version\/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Log browser and fetch support information
export function logBrowserInfo(): void {
  console.log('Browser Info:', {
    userAgent: navigator.userAgent,
    isSafari: isSafari(),
    safariVersion: getSafariVersion(),
    fetchSupported: isFetchSupported(),
    cookiesEnabled: navigator.cookieEnabled,
    language: navigator.language
  });
}