'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/planning');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use. Please sign in or use another email.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Incorrect email or password.");
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      router.push('/planning');
    } catch (err: any) {
      setError(err.message || 'Warning: An error occurred during Google sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-page)] font-sans">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
        <h1 className="text-3xl font-extrabold text-center text-[var(--text-primary)] mb-8 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--text-secondary)]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[var(--text-secondary)]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium tracking-widest"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 my-1 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-semibold text-center leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-70 shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--border-color)]"></div>
          <span className="text-sm font-bold tracking-wider text-[var(--text-secondary)]">OR</span>
          <div className="h-px flex-1 bg-[var(--border-color)]"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3.5 px-4 flex items-center justify-center gap-3 rounded-xl border-2 border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-page)] text-[var(--text-primary)] font-bold transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm font-semibold text-[var(--text-secondary)]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-extrabold transition-colors ml-1"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
