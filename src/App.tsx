import { useState, useEffect } from 'react';
import { FileText, Cloud, GripVertical, Loader2, LogOut } from 'lucide-react';
import { Auth } from './components/Auth';
import { DrivePage } from './components/DrivePage';
import { appwriteService } from './services/appwrite.service';
import type { User as UserType } from './types';

type AppCard = {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: 'blank' | 'drive';
  icon: typeof FileText;
  iconColor: string;
};

const apps: AppCard[] = [
  {
    id: 'blank',
    title: 'Blank Page',
    description: 'Voice-enabled writing surface with microphone access.',
    url: 'https://blank.page/',
    type: 'blank',
    icon: FileText,
    iconColor: '#ffd166',
  },
  {
    id: 'drive',
    title: 'Google Drive',
    description: 'Browse and open your Drive files.',
    type: 'drive',
    icon: Cloud,
    iconColor: '#4285f4',
  },
];

function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selected, setSelected] = useState<AppCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderedApps, setOrderedApps] = useState<AppCard[]>(apps);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragEnabled, setDragEnabled] = useState(false);

  useEffect(() => {
    checkAuth();
    loadSavedOrder();
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

  const loadSavedOrder = () => {
    const savedOrder = localStorage.getItem('appCardsOrder');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const reordered = orderIds
          .map((id: string) => apps.find((app) => app.id === id))
          .filter(Boolean) as AppCard[];
        const newApps = apps.filter((app) => !orderIds.includes(app.id));
        setOrderedApps([...reordered, ...newApps]);
      } catch (e) {
        console.error('Failed to load saved order', e);
      }
    }
  };

  const handleAuthSuccess = () => {
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await appwriteService.logout();
      setUser(null);
      setSelected(null);
    } catch (error: any) {
      alert(error.message || 'Failed to logout');
    }
  };

  const handleSelect = (app: AppCard) => {
    setSelected(app);
    if (app.type === 'blank') {
      setIsLoading(true);
    }
  };

  const handleBack = () => {
    setSelected(null);
    setIsLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!dragEnabled) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newApps = [...orderedApps];
    const draggedItem = newApps[draggedIndex];
    newApps.splice(draggedIndex, 1);
    newApps.splice(index, 0, draggedItem);

    setOrderedApps(newApps);
    setDraggedIndex(index);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragEnabled(false);
    const orderIds = orderedApps.map((app) => app.id);
    localStorage.setItem('appCardsOrder', JSON.stringify(orderIds));
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#303030]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-[#2a2a2a] border-[#3a3a3a]">
        <div className="flex items-center gap-2">
          {selected && (
            <>
              <div
                className="flex items-center justify-center w-6 h-6 rounded flex-shrink-0"
                style={{ backgroundColor: `${selected.iconColor}20` }}
              >
                <selected.icon className="w-4 h-4" style={{ color: selected.iconColor }} />
              </div>
              <h1 className="text-sm font-medium text-[#f4f4f4]">{selected.title}</h1>
            </>
          )}
          {!selected && <h1 className="text-sm font-medium text-[#f4f4f4]">My Apps</h1>}
        </div>
        <div className="flex items-center gap-3">
          {selected && (
            <button
              onClick={handleBack}
              className="px-3 py-1.5 text-xs bg-[#3c3c3c] text-[#f8f8f8] rounded hover:bg-[#4a4a4a]"
            >
              ← Back
            </button>
          )}
          <div className="flex items-center gap-2 pl-3 border-l border-[#3a3a3a]">
            <span className="text-xs text-[#b5b5b5]">{user.email}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#b5b5b5] hover:text-red-400 hover:bg-[#3c3c3c] rounded"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {!selected && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-[#f4f4f4] mb-6">Select an App</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderedApps.map((app, index) => {
                  const Icon = app.icon;
                  const isDragging = draggedIndex === index;

                  return (
                    <div
                      key={app.id}
                      draggable={dragEnabled}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => !dragEnabled && handleSelect(app)}
                      className="group flex flex-col bg-[#262626] border border-[#404040] hover:border-[#606060] hover:bg-[#2a2a2a] rounded-xl p-6 cursor-pointer transition-all"
                      style={{
                        opacity: isDragging ? 0.5 : 1,
                        transform: isDragging ? 'scale(1.05) rotate(2deg)' : 'scale(1)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="flex items-center justify-center w-12 h-12 rounded-lg"
                          style={{ backgroundColor: `${app.iconColor}15` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: app.iconColor }} />
                        </div>
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDragEnabled(true);
                          }}
                          onMouseUp={(e) => {
                            e.stopPropagation();
                            setDragEnabled(false);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded hover:bg-[#3a3a3a] cursor-grab active:cursor-grabbing"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4 text-[#808080]" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-[#f4f4f4] mb-2">{app.title}</h3>
                      <p className="text-sm text-[#c2c2c2]">{app.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selected && selected.type === 'drive' && <DrivePage />}

        {selected && selected.type === 'blank' && (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#303030]">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                  <p className="text-sm text-[#c2c2c2]">Loading {selected.title}...</p>
                </div>
              </div>
            )}
            <iframe
              src={selected.url}
              title={selected.title}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              allow="microphone; camera; clipboard-read; clipboard-write; autoplay; fullscreen"
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
