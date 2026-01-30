import { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { appwriteService } from '../services/appwrite.service';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await appwriteService.login(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setIsLoading(false);
          return;
        }
        await appwriteService.createAccount(email, password, name);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20}}>
      <div style={{width: '100%', maxWidth: 520}}>
        <div className="saas-card">
          {/* Header */}
          <div style={{textAlign: 'center', marginBottom: 18}}>
            <div style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, borderRadius:12, marginBottom:12, background:'linear-gradient(180deg,var(--elevated),#6e3a48)'}}>
              {isLogin ? (
                <LogIn className="w-6 h-6" />
              ) : (
                <UserPlus className="w-6 h-6" />
              )}
            </div>
            <h1 style={{margin:0, fontSize:22, fontWeight:700}}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="muted">{isLogin ? 'Sign in to access your ideas' : 'Sign up to start tracking your ideas'}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{marginBottom:12, padding:12, background:'#3b1a1f', borderRadius:8}}>
              <p style={{margin:0,color:'#ffb3b3',fontSize:13}}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="" style={{display:'grid',gap:12}}>
            {!isLogin && (
              <div className="form-row">
                <label className="label">Full Name</label>
                <div style={{position:'relative'}}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <label className="label">Email Address</label>
              <div style={{position:'relative'}}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <label className="label">Password</label>
              <div style={{position:'relative'}}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              {!isLogin && <p className="muted" style={{fontSize:12}}>Must be at least 8 characters</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{width:'100%',display:'inline-flex',justifyContent:'center',alignItems:'center'}}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span style={{marginLeft:8}}>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span style={{marginLeft:8}}>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div style={{marginTop:12,textAlign:'center'}}>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="btn btn-ghost"
              style={{fontSize:13}}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="muted" style={{marginTop:12,textAlign:'center'}}>Powered by Appwrite</p>
      </div>
    </div>
  );
}
