import { useState } from 'react';
import { ScriptsPage } from './components/ScriptsPage';
import { scriptLibrary, type ScriptCard } from './scripts/library';
import { FileText, Edit3,  Code2, LucideIcon } from 'lucide-react';

type AppCard = {
  id: string;
  title: string;
  description: string;
  url?: string;
  type?: 'web' | 'scripts';
  scripts?: ScriptCard[];
  icon?: LucideIcon;
  iconColor?: string;
};

const apps: AppCard[] = [
  {
    id: 'blank',
    title: 'Blank Page',
    description: 'Open a clean writing surface in the sidebar.',
    url: 'https://blank.page/',
    type: 'web',
    icon: FileText,
    iconColor: '#ffd166',
  },
  {
    id: 'stackedit',
    title: 'StackEdit',
    description: 'Markdown editor in the browser.',
    url: 'https://stackedit.io/app#',
    type: 'web',
    icon: Edit3,
    iconColor: '#a78bfa',
  },
  
  {
    id: 'scripts',
    title: 'My Scripts',
    description: 'Quick tools like Email Extractor.',
    type: 'scripts',
    scripts: scriptLibrary,
    icon: Code2,
    iconColor: '#7dd3fc',
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
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      console.warn('Chrome APIs are not available. Are you running in a browser?');
      alert('Script execution only works when running as a Chrome Extension.');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') || tab.url?.startsWith('about:') || tab.url?.startsWith('chrome-extension://')) {
        alert('Cannot run scripts on this page. Browser security restricts extensions from running on system pages.');
        return;
      }

      let code = script.code.trim();
      if (code.startsWith('javascript:')) {
        code = code.substring(11);
        try {
          code = decodeURIComponent(code);
        } catch {
          // ignore
        }
      }

      if (script.func) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: script.func,
          world: 'ISOLATED',
        });
      } else {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (codeToRun) => {
            try {
              console.log('Sidebar Extension: Injecting script...');
              // We use eval in the ISOLATED world to bypass page CSP (Content Security Policy)
              // This works for scripts that only need DOM access.
              // If a script needs access to page variables (window.X), it won't work here.
              eval(codeToRun);
              console.log('Sidebar Extension: Script started.');
            } catch (e) {
              console.error('Sidebar Extension: Script failed:', e);
            }
          },
          args: [code],
          world: 'ISOLATED',
        });
      }
      
      console.log('Script executed successfully');
    } catch (err) {
      console.error('Script execution failed', err);
      alert('Script execution failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ backgroundColor: '#303030' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
      >
        <div className="flex items-center gap-2">
          {selected && selected.url && (
            <img 
              src={`https://www.google.com/s2/favicons?domain=${new URL(selected.url).hostname}&sz=64`}
              alt=""
              className="w-5 h-5 rounded"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <h1 className="text-sm font-medium" style={{ color: '#f4f4f4' }}>
            {selected ? selected.title : 'My Sidebar'}
          </h1>
        </div>
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
              {apps.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => handleSelect(app)}
                    className="group flex flex-col text-left bg-[#262626] border border-[#404040] hover:border-[#606060] hover:bg-[#2a2a2a] rounded-xl p-5 transition-all duration-200 shadow-lg hover:shadow-xl h-full"
                  >
                    <div className="flex items-center gap-3 w-full mb-3">
                      {Icon && (
                        <div 
                          className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: app.iconColor ? `${app.iconColor}15` : '#3a3a3a' }}
                        >
                          <Icon 
                            className="w-5 h-5" 
                            style={{ color: app.iconColor || '#f4f4f4' }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-base font-semibold text-[#f4f4f4]">
                          {app.title}
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          backgroundColor: app.iconColor || '#505050',
                          color: '#0f172a',
                        }}
                      >
                        {app.id === 'blank' ? 'Live' : app.type === 'scripts' ? 'Tools' : 'Web'}
                      </span>
                    </div>
                    <p className="text-sm text-[#c2c2c2] mb-4 flex-1">
                      {app.description}
                    </p>
                    <div
                      className="h-1.5 w-full rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: app.iconColor || '#4f4f4f' }}
                    ></div>
                  </button>
                );
              })}
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
