import { useState, useEffect } from 'react';
import { Lightbulb, LogOut, User, Loader2 } from 'lucide-react';
import { Auth } from './components/Auth';
import { IdeasList } from './components/IdeasList';
import { IdeaForm } from './components/IdeaForm';
import { ScriptsPage } from './components/ScriptsPage';
import { appwriteService } from './services/appwrite.service';
import { scriptLibrary, type ScriptCard } from './scripts/library';
import type { Idea, User as UserType } from './types';

type View = 'ideas' | 'scripts';

function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentView, setCurrentView] = useState<View>('ideas');
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsCheckingAuth(true);
    try {
      const currentUser = await appwriteService.getCurrentUser();
      setUser(currentUser as UserType);
    } catch (error) {
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleAuthSuccess = () => {
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await appwriteService.logout();
      setUser(null);
    } catch (error: any) {
      alert(error.message || 'Failed to logout');
    }
  };

  const handleCreateNew = () => {
    setEditingIdea(null);
    setShowIdeaForm(true);
  };

  const handleEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setShowIdeaForm(true);
  };

  const handleFormClose = () => {
    setShowIdeaForm(false);
    setEditingIdea(null);
  };

  const handleFormSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
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
      alert('Script execution only works when running as a Chrome Extension.');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      if (
        tab.url?.startsWith('chrome://') ||
        tab.url?.startsWith('edge://') ||
        tab.url?.startsWith('about:') ||
        tab.url?.startsWith('chrome-extension://')
      ) {
        alert('Cannot run scripts on this page due to browser security restrictions.');
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
              eval(codeToRun);
            } catch (e) {
              console.error('Script execution failed:', e);
            }
          },
          args: [code],
          world: 'ISOLATED',
        });
      }
    } catch (err) {
      console.error('Script execution failed', err);
      alert('Script execution failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Main app UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Idea Tracker</h1>
                <p className="text-xs text-gray-500">Powered by Appwrite</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('ideas')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === 'ideas'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💡 Ideas
                </button>
                <button
                  onClick={() => setCurrentView('scripts')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === 'scripts'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🔧 Scripts
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full">
                  <User className="w-5 h-5 text-white" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-80px)]">
        {currentView === 'ideas' ? (
          <IdeasList
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <div className="p-6">
            <ScriptsPage
              scripts={scriptLibrary}
              copiedId={copiedId}
              onCopy={copyScript}
              onRun={handleRunScript}
            />
          </div>
        )}
      </div>

      {/* Idea Form Modal */}
      {showIdeaForm && (
        <IdeaForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editingIdea={editingIdea}
        />
      )}
    </div>
  );
}

export default App;
