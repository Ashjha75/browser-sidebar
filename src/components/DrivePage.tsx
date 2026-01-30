import { useState, useEffect, useCallback } from 'react';
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
      <div style={{height:'100%',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{maxWidth:480,width:'100%'}} className="saas-card text-center">
          <div style={{marginBottom:12}}>
            <div style={{width:80,height:80,margin:'0 auto 12px',background:'#262626',borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg style={{width:40,height:40}} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 2.5l6.5 11.3h-6.5v7.7l-6.5-11.3h6.5z" opacity="0.5"/>
                <path d="M6 13.8L12.5 2.5v11.3H6z" fill="#0066da"/>
                <path d="M12.5 21.5v-7.7H19z" fill="#00ac47"/>
              </svg>
            </div>
            <h2 style={{fontSize:18,fontWeight:600,margin:0,color:'var(--text-primary)'}}>Connect to Google Drive</h2>
            <p className="muted" style={{marginTop:8,marginBottom:12}}>Sign in to browse and open your Drive files directly from the sidebar. Read-only access, no data stored.</p>
          </div>

          {error && (
            <div style={{marginBottom:12,padding:10,background:'#3b1010',borderRadius:8}}>
              <span style={{color:'#ffb3b3'}}>{error}</span>
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={isAuthenticating}
            className="btn btn-primary"
            style={{width:'100%',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:10}}
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <p className="muted" style={{marginTop:10,fontSize:12}}>Only read-only access to your files. No uploads or edits.</p>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div style={{height:'100%',width:'100%',display:'flex',flexDirection:'column'}}>
      {/* Search and Actions Bar */}
      <div className="saas-card" style={{padding:'12px',display:'flex',alignItems:'center',gap:12}}>
        <div style={{flex:1,display:'flex',alignItems:'center',gap:8}}>
          <Search className="icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="input"
            style={{flex:1}}
          />
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={() => fetchFiles(true)} disabled={loading} className="btn btn-secondary" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleLogout} className="btn btn-ghost" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div style={{padding:10,marginTop:12}}>
          <div style={{padding:8,background:'#3b1010',borderRadius:8,color:'#ffb3b3'}}>{error}</div>
        </div>
      )}

      {/* Files List */}
      <div style={{flex:1,overflow:'auto',padding:16}}>
        {loading && files.length === 0 ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
            <div style={{textAlign:'center'}}>
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="muted" style={{marginTop:8}}>Loading files...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>
            <div style={{textAlign:'center',maxWidth:320}}>
              <File className="w-12 h-12 muted" />
              <p style={{marginTop:8,fontSize:14,fontWeight:600}}>No files found</p>
              <p className="muted" style={{marginTop:6}}>{searchQuery ? 'Try a different search term' : 'Your Drive appears to be empty'}</p>
            </div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:900,margin:'0 auto'}}>
            {files.map((file) => {
              const Icon = getFileIcon(file.mimeType);
              return (
                <div key={file.id} onClick={() => handleOpenFile(file)} className="saas-card" style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
                  <div style={{flexShrink:0,width:40,height:40,borderRadius:8,background:'#1e1e1e',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    {file.thumbnailLink ? (
                      <img src={file.thumbnailLink} alt="" className="w-full h-full object-cover" />
                    ) : file.iconLink ? (
                      <img src={file.iconLink} alt="" className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5 muted" />
                    )}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                      <p style={{margin:0,fontSize:14,fontWeight:600,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</p>
                      <ExternalLink className="icon" />
                    </div>
                    <p className="muted" style={{marginTop:6,fontSize:12}}>Modified {formatDate(file.modifiedTime)}</p>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div style={{display:'flex',justifyContent:'center'}}>
                <button onClick={handleLoadMore} disabled={loading} className="btn btn-secondary">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span style={{marginLeft:8}}>Loading more...</span>
                    </>
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
