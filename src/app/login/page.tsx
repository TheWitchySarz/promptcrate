'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '../(components)/layout/Navbar';
import Footer from '../(components)/shared/Footer';
import { Mail, Lock, Github, LogIn as GoogleIcon } from 'lucide-react';
import { useAuth } from '../(contexts)/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function SearchParamsHandler({ onParams }: { onParams: (params: URLSearchParams) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    onParams(searchParams);
  }, [searchParams, onParams]);
  
  return null;
}

function LoginContent() {
  const { signInWithEmail, signInWithGoogle, isLoggedIn, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && !authIsLoading && searchParams) {
      const redirectTo = searchParams.get('redirect_to');
      if (redirectTo && redirectTo.startsWith('/')) {
        router.push(redirectTo);
      } else {
        router.push('/app/editor');
      }
    }
  }, [isLoggedIn, authIsLoading, router, searchParams]);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: loginError } = await signInWithEmail(email, password);
    setLoading(false);

    if (loginError) {
      setError(loginError.message);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError(null);
    setMessage(null);
    setLoading(true);

    if (provider === 'google') {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) {
        setError(googleError.message);
        setLoading(false);
      }
    } else if (provider === 'github') {
      setError('GitHub login is not yet implemented.');
      console.log("Attempting GitHub Auth - to be implemented");
      setLoading(false);
    }
  };

  if (authIsLoading || isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-700">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Suspense fallback={<div>Loading search params...</div>}>
        <SearchParamsHandler onParams={setSearchParams} />
      </Suspense>
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Log in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-500">
                create a new account
              </Link>
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <GoogleIcon size={20} className="mr-2 text-red-500" /> 
              Log in with Google
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Github size={20} className="mr-2 text-gray-800" />
              Log in with GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
            <div className="rounded-md shadow-sm">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  disabled={loading}
                />
              </div>
              <div className="relative -mt-px"> 
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            {message && <p className="text-sm text-green-600 text-center">{message}</p>}

            <div>
              <button
                type="submit"
                disabled={loading || authIsLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                {(loading || authIsLoading) ? 'Processing...' : 'Log in'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-700">Loading...</p>
        </main>
        <Footer />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 