import { useState } from 'react';

type AppCard = {
  id: string;
  title: string;
  description: string;
  url: string;
};

const apps: AppCard[] = [
  {
    id: 'blank',
    title: 'Blank Page',
    description: 'Open a clean writing surface in the sidebar.',
    url: 'https://blank.page/',
  },
  {
    id: 'notes',
    title: 'Notes (coming soon)',
    description: 'Draft notes and todos in-place. (Preview)',
    url: 'https://blank.page/',
  },
  {
    id: 'links',
    title: 'Links Hub (coming soon)',
    description: 'Save quick links and switch fast. (Preview)',
    url: 'https://blank.page/',
  },
  {
    id: 'ai',
    title: 'AI Assist (coming soon)',
    description: 'Summaries and quick answers. (Preview)',
    url: 'https://blank.page/',
  },
  {
    id: 'colab',
    title: 'Google Colab',
    description: 'Run notebooks in the sidebar (may require sign-in).',
    url: 'https://colab.research.google.com/',
  },
];

function App() {
  const [selected, setSelected] = useState<AppCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (app: AppCard) => {
    setSelected(app);
    setIsLoading(true);
    setError(null);
  };

  const handleBack = () => {
    setSelected(null);
    setError(null);
    setIsLoading(false);
  };

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
          {selected ? selected.title : 'My Sidebar'}
        </h1>
        <div className="flex items-center gap-3">
          {selected && (
            <button
              onClick={handleBack}
              className="px-3 py-1 rounded-md text-xs"
              style={{ backgroundColor: '#3c3c3c', color: '#f8f8f8' }}
            >
              ← Back
            </button>
          )}
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
        {!selected && (
          <div className="h-full w-full overflow-auto" style={{ backgroundColor: '#303030' }}>
            <div
              className="grid grid-cols-1 gap-3 p-3"
              style={{ minHeight: '100%', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
            >
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleSelect(app)}
                  className="text-left rounded-xl p-4 transition-all shadow-sm"
                  style={{
                    backgroundColor: '#3a3a3a',
                    border: '1px solid #4a4a4a',
                    color: '#f4f4f4',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="text-sm font-semibold" style={{ color: '#f4f4f4' }}>
                      {app.title}
                    </div>
                    <span
                      className="text-xxs px-2 py-1 rounded-full"
                      style={{ backgroundColor: app.id === 'blank' ? '#ffd166' : '#505050', color: '#0f172a' }}
                    >
                      {app.id === 'blank' ? 'Live' : 'Preview'}
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: '#c2c2c2' }}>
                    {app.description}
                  </p>
                  <div
                    className="h-1 rounded-full"
                    style={{ backgroundColor: app.id === 'blank' ? '#ffd166' : '#4f4f4f' }}
                  ></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <>
            {isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: '#303030' }}
              >
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-600 border-r-transparent mb-3"></div>
                  <p className="text-sm" style={{ color: '#c2c2c2' }}>
                    Loading {selected.title}...
                  </p>
                </div>
              </div>
            )}

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
                    Unable to Load {selected.title}
                  </h2>
                  <p className="text-sm" style={{ color: '#c2c2c2' }}>{error}</p>
                </div>
              </div>
            )}

            <iframe
              key={selected.id}
              src={selected.url}
              title={selected.title}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="microphone *; clipboard-read *; clipboard-write *; storage-access *; autoplay *; fullscreen *"
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
