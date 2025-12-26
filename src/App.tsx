import { useState } from 'react';
import { ScriptsPage } from './components/ScriptsPage';
import { scriptLibrary, type ScriptCard } from './scripts/library';

type AppCard = {
  id: string;
  title: string;
  description: string;
  url?: string;
  type?: 'web' | 'scripts';
  scripts?: ScriptCard[];
};

const apps: AppCard[] = [
  {
    id: 'blank',
    title: 'Blank Page',
    description: 'Open a clean writing surface in the sidebar.',
    url: 'https://blank.page/',
    type: 'web',
  },
  
  {
    id: 'scripts',
    title: 'My Scripts',
    description: 'Quick tools like Email Extractor.',
    type: 'scripts',
    scripts: scriptLibrary,
  },
  
];

function App() {
  const [selected, setSelected] = useState<AppCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSelect = (app: AppCard) => {
    setSelected(app);
    setIsLoading(app.type === 'scripts' ? false : true);
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

  const copyScript = async (script: ScriptCard) => {
    try {
      await navigator.clipboard.writeText(script.code.trim());
      setCopiedId(script.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleRunScript = async (script: ScriptCard) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      let code = script.code.trim();
      if (code.startsWith('javascript:')) {
        code = code.substring(11);
        try {
          code = decodeURIComponent(code);
        } catch {
          // ignore
        }
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (codeToRun) => {
          const script = document.createElement('script');
          script.textContent = codeToRun;
          (document.head || document.documentElement).appendChild(script);
          script.remove();
        },
        args: [code],
        world: 'MAIN',
      });
    } catch (err) {
      console.error('Script execution failed', err);
    }
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
          <div className="h-full w-full overflow-auto bg-[#303030] p-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 max-w-7xl mx-auto">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleSelect(app)}
                  className="group flex flex-col text-left bg-[#262626] border border-[#404040] hover:border-[#606060] hover:bg-[#2a2a2a] rounded-xl p-5 transition-all duration-200 shadow-lg hover:shadow-xl h-full"
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="text-base font-semibold text-[#f4f4f4]">
                      {app.title}
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                      style={{
                        backgroundColor: app.id === 'blank' ? '#ffd166' : app.type === 'scripts' ? '#7dd3fc' : '#505050',
                        color: '#0f172a',
                      }}
                    >
                      {app.id === 'blank' ? 'Live' : app.type === 'scripts' ? 'Tools' : 'Preview'}
                    </span>
                  </div>
                  <p className="text-sm text-[#c2c2c2] mb-4 flex-1">
                    {app.description}
                  </p>
                  <div
                    className="h-1.5 w-full rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: app.id === 'blank' ? '#ffd166' : app.type === 'scripts' ? '#7dd3fc' : '#4f4f4f' }}
                  ></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <>
            {selected.type === 'scripts' ? (
              <ScriptsPage
                scripts={selected.scripts ?? []}
                copiedId={copiedId}
                onCopy={copyScript}
                onRun={handleRunScript}
              />
            ) : (
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
          </>
        )}
      </main>
    </div>
  );
}

export default App;
