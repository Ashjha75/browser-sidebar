import { useState, useEffect } from 'react';

const WEBSITE_URL = 'https://blank.page/';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial load check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load website. The site may not allow embedding.');
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ backgroundColor: '#303030' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
      >
        <h1 className="text-sm font-medium" style={{ color: '#f4f4f4' }}>
          Website Sidebar
        </h1>
        <div className="flex items-center gap-3">
          <button
            aria-label="Close"
            onClick={() => window.close()}
            className="w-8 h-8 flex items-center justify-center rounded-md"
            style={{ backgroundColor: '#3c3c3c', color: '#f8f8f8' }}
          >
            ×
          </button>
          <div className="text-xs" style={{ color: '#b5b5b5' }}>
            {isLoading ? 'Loading...' : 'Ready'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: '#303030' }}
          >
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-600 border-r-transparent mb-3"></div>
              <p className="text-sm" style={{ color: '#c2c2c2' }}>
                Loading website...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: '#303030' }}
          >
            <div className="text-center max-w-md px-4">
              <div className="mb-3" style={{ color: '#f87171' }}>
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#f4f4f4' }}>
                Unable to Load Website
              </h2>
              <p className="text-sm" style={{ color: '#c2c2c2' }}>{error}</p>
            </div>
          </div>
        )}

        {/* iframe */}
        <iframe
          src={WEBSITE_URL}
          title="External Website"
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="microphone *; clipboard-read *; clipboard-write *; storage-access *; autoplay *; fullscreen *"
        />
      </main>
    </div>
  );
}

export default App;
