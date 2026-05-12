import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function AuthModal({
  open,
  onClose,
  title = 'Sign in to continue',
  description = 'Create a free account to predict scores, join groups, and climb the leaderboard.',
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fn = mode === 'signin' ? signIn : signUp;
      const { error: authError } = await fn(email, password);
      if (authError) {
        setError(authError.message);
      } else {
        onClose();
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    const { error: authError } = await signInWithGoogle();
    if (authError) setError(authError.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
      <div className="relative bg-paper border-2 border-ink rounded-md shadow-paper w-full max-w-md p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-sunshine/40 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h2 className="font-display font-black text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium border-2 transition ${
              mode === 'signin' ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-1.5" /> Sign in
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium border-2 transition ${
              mode === 'signup' ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-1.5" /> Sign up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-md text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-num uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40 font-mono-num text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono-num uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40 font-mono-num text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 h-11 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition stamp disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-ink/15" />
          <span>or</span>
          <div className="flex-1 h-px bg-ink/15" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full px-5 h-11 rounded-full border-2 border-ink text-ink font-medium hover:bg-sunshine/40 transition"
        >
          Continue with Google
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Or visit the full{' '}
          <Link to="/login" className="underline underline-offset-2 text-foreground">
            sign in page
          </Link>
        </p>
      </div>
    </div>
  );
}
