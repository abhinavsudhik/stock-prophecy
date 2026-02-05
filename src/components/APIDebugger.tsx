import React, { useState, useEffect } from 'react';

export const APIDebugger: React.FC = () => {
  const [apiTest, setApiTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setApiTest(null);

    try {
      console.log('🧪 Testing API call...');
      
      // Test basic fetch
      const response = await fetch('/api/stock-data?symbol=AAPL&period=1M');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      setApiTest({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        dataLength: data.length,
        firstItem: data[0],
        lastItem: data[data.length - 1]
      });
      
    } catch (err) {
      console.error('❌ API test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test on mount
    testAPI();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">API Debug</h3>
        <button
          onClick={testAPI}
          disabled={loading}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>
      </div>
      
      {loading && (
        <div className="text-sm text-blue-600">Testing API connection...</div>
      )}
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {apiTest && (
        <div className="text-xs space-y-2">
          <div className="text-green-600 bg-green-50 p-2 rounded">
            <strong>✅ API Working!</strong>
          </div>
          <div>
            <strong>Status:</strong> {apiTest.status}
          </div>
          <div>
            <strong>Data Points:</strong> {apiTest.dataLength}
          </div>
          {apiTest.firstItem && (
            <div>
              <strong>First:</strong> {apiTest.firstItem.date} - ${apiTest.firstItem.close}
            </div>
          )}
          {apiTest.lastItem && (
            <div>
              <strong>Last:</strong> {apiTest.lastItem.date} - ${apiTest.lastItem.close}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        Browser: {navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' : 'Other'}
      </div>
    </div>
  );
};