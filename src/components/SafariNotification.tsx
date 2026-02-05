import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';
import { isSafari, getSafariVersion } from '@/utils/fetchPolyfill';
import { testAPIConnectivity } from '@/utils/safariDebug';

export const SafariNotification: React.FC = () => {
  const [show, setShow] = useState(false);
  const [apiStatus, setApiStatus] = useState<'testing' | 'success' | 'failed' | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show for Safari users
    if (!isSafari() || dismissed) return;

    const safariVersion = getSafariVersion();
    
    // Show notification for older Safari versions or after API test
    if (safariVersion && safariVersion < 14) {
      setShow(true);
    } else {
      // Test API connectivity
      setApiStatus('testing');
      testAPIConnectivity(window.location.origin).then(result => {
        setApiStatus(result.success ? 'success' : 'failed');
        if (!result.success) {
          setShow(true);
        }
      });
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    // Store dismissal in localStorage to persist across sessions
    localStorage.setItem('safari-notification-dismissed', 'true');
  };

  useEffect(() => {
    // Check if notification was previously dismissed
    const wasDismissed = localStorage.getItem('safari-notification-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!show || !isSafari()) return null;

  const safariVersion = getSafariVersion();
  const isOldSafari = safariVersion && safariVersion < 14;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md bg-white border border-yellow-200 rounded-lg shadow-lg">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {isOldSafari || apiStatus === 'failed' ? (
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            ) : (
              <Info className="h-5 w-5 text-blue-400" />
            )}
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {isOldSafari ? 'Safari Compatibility Notice' : 'Safari User Tips'}
            </h3>
            
            <div className="mt-2 text-sm text-gray-600">
              {isOldSafari ? (
                <div>
                  <p>Your Safari version ({safariVersion}) may have limited compatibility.</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Update to Safari 14+ for better performance</li>
                    <li>Some features may not work as expected</li>
                  </ul>
                </div>
              ) : apiStatus === 'failed' ? (
                <div>
                  <p>Having trouble loading data? This might help:</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Disable content blockers for this site</li>
                    <li>Allow cross-site tracking temporarily</li>
                    <li>Clear browser cache and reload</li>
                    <li>Check your internet connection</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p>For the best experience in Safari:</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Allow this site in any content blockers</li>
                    <li>Enable JavaScript if disabled</li>
                  </ul>
                </div>
              )}
              
              {apiStatus === 'testing' && (
                <p className="mt-2 text-blue-600">
                  Testing connectivity...
                </p>
              )}
            </div>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleDismiss}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reload Page
          </button>
          
          <button
            onClick={handleDismiss}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};