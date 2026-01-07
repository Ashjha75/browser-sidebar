import { useState, useEffect } from 'react';
import { Search, RefreshCw, LogOut, FileText, Image, Video, Music, File, ExternalLink, Loader2 } from 'lucide-react';

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
};

type DrivePageProps = {
  // No props needed for now
};

export function DrivePage({}: DrivePageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Get icon for file type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('document') || mimeType.includes('text')) return FileText;
    return File;
  };

  // Get file URL to open
  const getFileUrl = (file: DriveFile) => {
    const { id, mimeType, webViewLink } = file;
    
    // Use webViewLink if available
    if (webViewLink) return webViewLink;
    
    // Otherwise construct URL based on mime type
    if (mimeType === 'application/vnd.google-apps.document') {
      return `https://docs.google.com/document/d/${id}`;
    } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      return `https://docs.google.com/spreadsheets/d/${id}`;
    } else if (mimeType === 'application/vnd.google-apps.presentation') {
      return `https://docs.google.com/presentation/d/${id}`;
    } else if (mimeType === 'application/vnd.google-apps.form') {
      return `https://docs.google.com/forms/d/${id}`;
    } else {
      return `https://drive.google.com/file/d/${id}/view`;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  // Authenticate with Google Drive
  const handleAuth = async () => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const response = await chrome.runtime.sendMessage({ type: 'DRIVE_AUTH' });
      
      if (response.success) {
        setIsAuthenticated(true);
        // Fetch initial files
        fetchFiles(true);
      } else {
        setError(response.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'DRIVE_LOGOUT' });
      setIsAuthenticated(false);
      setFiles([]);
      setNextPageToken(null);
      setHasMore(true);
      setSearchQuery('');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Fetch files from Drive
  const fetchFiles = async (reset = false, query = searchQuery) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DRIVE_FETCH_FILES',
        query: query,
        pageToken: reset ? '' : nextPageToken || '',
        pageSize: 20
      });
      
      if (response.success) {
        const newFiles = response.data.files || [];
        setFiles(reset ? newFiles : [...files, ...newFiles]);
        setNextPageToken(response.data.nextPageToken || null);
        setHasMore(!!response.data.nextPageToken);
      } else {
        if (response.error === 'AUTH_EXPIRED') {
          setIsAuthenticated(false);
          setError('Session expired. Please sign in again.');
        } else {
          setError(response.error || 'Failed to fetch files');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const timer = setTimeout(() => {
      fetchFiles(true, searchQuery);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [searchQuery, isAuthenticated]);

  // Open file in new tab
  const handleOpenFile = (file: DriveFile) => {
    const url = getFileUrl(file);
    chrome.tabs.create({ url });
  };

  // Load more files
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchFiles(false);
    }
  };

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#303030] p-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#262626] rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-[#4285f4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 2.5l6.5 11.3h-6.5v7.7l-6.5-11.3h6.5z" opacity="0.5"/>
                <path d="M6 13.8L12.5 2.5v11.3H6z" fill="#0066da"/>
                <path d="M12.5 21.5v-7.7H19z" fill="#00ac47"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#f4f4f4] mb-2">
              Connect to Google Drive
            </h2>
            <p className="text-sm text-[#c2c2c2] mb-6">
              Sign in to browse and open your Drive files directly from the sidebar.
              Read-only access, no data stored.
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}
          
          <button
            onClick={handleAuth}
            disabled={isAuthenticating}
            className="w-full py-3 px-4 bg-[#4285f4] hover:bg-[#3367d6] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
          
          <p className="mt-4 text-xs text-[#a0a0a0]">
            Only read-only access to your files. No uploads or edits.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="h-full w-full flex flex-col bg-[#303030]">
      {/* Search and Actions Bar */}
      <div className="flex-shrink-0 p-4 bg-[#262626] border-b border-[#404040]">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#404040] rounded-lg text-sm text-[#f4f4f4] placeholder-[#808080] focus:outline-none focus:border-[#4285f4]"
            />
          </div>
          <button
            onClick={() => fetchFiles(true)}
            disabled={loading}
            className="p-2 bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#f8f8f8] rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 bg-[#3c3c3c] hover:bg-[#4a4a4a] text-[#f8f8f8] rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        {error && (
          <div className="p-2 bg-red-900/20 border border-red-700/50 rounded text-xs text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-auto p-4">
        {loading && files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#4285f4] mx-auto mb-2" />
              <p className="text-sm text-[#c2c2c2]">Loading files...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <File className="w-12 h-12 text-[#808080] mx-auto mb-3" />
              <p className="text-sm text-[#c2c2c2] mb-1">No files found</p>
              <p className="text-xs text-[#a0a0a0]">
                {searchQuery ? 'Try a different search term' : 'Your Drive appears to be empty'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-w-4xl mx-auto">
            {files.map((file) => {
              const Icon = getFileIcon(file.mimeType);
              return (
                <div
                  key={file.id}
                  onClick={() => handleOpenFile(file)}
                  className="flex items-center gap-3 p-3 bg-[#262626] border border-[#404040] hover:border-[#606060] hover:bg-[#2a2a2a] rounded-lg cursor-pointer transition-all group"
                >
                  {/* Thumbnail or Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded bg-[#1e1e1e] flex items-center justify-center overflow-hidden">
                    {file.thumbnailLink ? (
                      <img 
                        src={file.thumbnailLink} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : file.iconLink ? (
                      <img 
                        src={file.iconLink} 
                        alt="" 
                        className="w-6 h-6"
                      />
                    ) : (
                      <Icon className="w-5 h-5 text-[#a0a0a0]" />
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#f4f4f4] truncate">
                        {file.name}
                      </p>
                      <ExternalLink className="w-3 h-3 text-[#808080] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <p className="text-xs text-[#a0a0a0] mt-0.5">
                      Modified {formatDate(file.modifiedTime)}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full py-3 px-4 bg-[#262626] hover:bg-[#2a2a2a] border border-[#404040] hover:border-[#606060] text-[#f4f4f4] text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  'Load more'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
