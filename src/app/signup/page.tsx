'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '../(components)/layout/Navbar';
import Footer from '../(components)/shared/Footer';
import { Mail, Lock, LogIn, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../(contexts)/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

// Helper component to use useSearchParams because SignupPage is not wrapped in Suspense boundary by default
function SignupForm() {
  const { signUpWithEmail, signInWithGoogle, isLoggedIn, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeSessionIdFromUrl = searchParams.get('stripe_session_id');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalizingPro, setFinalizingPro] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && !authIsLoading) {
      router.push('/app/editor');
    }
  }, [isLoggedIn, authIsLoading, router, stripeSessionIdFromUrl]);

  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    setFinalizingPro(false);

    if (!username.trim()) {
      setError('Username is required.');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username must be 3-20 characters long and can only contain letters, numbers, and underscores.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await signUpWithEmail(email, password, username);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (signUpData && signUpData.user && stripeSessionIdFromUrl) {
      setFinalizingPro(true);
      try {
        const finalizeResponse = await fetch('/api/stripe/finalize-pro-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: signUpData.user.id, stripeSessionId: stripeSessionIdFromUrl }),
        });
        const finalizeData = await finalizeResponse.json();

        if (!finalizeResponse.ok) {
          throw new Error(finalizeData.error || 'Failed to finalize Pro plan. Please contact support.');
        }
        setMessage('Welcome to PromptCrate Pro! Please check your email to confirm your account, then log in to access all features.');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } catch (finalizeError: any) {
        console.error("Error finalizing Pro signup:", finalizeError);
        setError(`Account created, but Pro plan activation failed: ${finalizeError.message}. Please confirm email & contact support with session ID: ${stripeSessionIdFromUrl}`);
      } finally {
        setFinalizingPro(false);
      }
    } else if (signUpData) {
      setMessage('Account created! Check your email for a confirmation link. After confirming, you can log in.');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError('An unexpected error occurred during signup.');
    }
    setLoading(false);
  };

  const handleOAuthSignup = async (provider: 'google' | 'github') => {
    setError(null);
    setMessage(null);
    setLoading(true);

    if (stripeSessionIdFromUrl) {
      setMessage("Signing up with Google/GitHub after Stripe payment is not yet fully integrated for automatic Pro activation. Please complete signup, then contact support if your Pro plan isn't active.");
    }

    if (provider === 'google') {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) {
        setError(googleError.message);
      }
    } else if (provider === 'github') {
      setError('GitHub signup is not yet implemented.');
      setLoading(false);
    }
  };

  if (authIsLoading || (isLoggedIn && !stripeSessionIdFromUrl)) {
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
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {stripeSessionIdFromUrl ? 'Complete Your Pro Account' : 'Create your PromptCrate account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                log in if you already have an account
              </Link>
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignup('google')}
              disabled={loading || finalizingPro}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <LogIn size={20} className="mr-2 text-red-500" />
              Sign up with Google
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

          <form className="mt-8 space-y-6" onSubmit={handleEmailSignup}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="Username (3-20 chars, a-z, 0-9, _)"
                    disabled={loading || finalizingPro}
                  />
                </div>
              </div>
              <div className="pt-px">
                <label htmlFor="email-address" className="sr-only">Email address</label>
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
                    className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    disabled={loading || finalizingPro}
                  />
                </div>
              </div>
              <div className="pt-px">
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="Password (min. 6 characters)"
                    disabled={loading || finalizingPro}
                  />
                </div>
              </div>
               <div className="pt-px">
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    disabled={loading || finalizingPro}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            {message && <p className="text-sm text-green-600 text-center">{message}</p>}

            <div>
              <button
                type="submit"
                disabled={loading || authIsLoading || finalizingPro}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                {loading || authIsLoading || finalizingPro ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {finalizingPro ? 'Finalizing Pro Plan...' : 'Processing...'}
                  </>
                ) : (stripeSessionIdFromUrl ? 'Create Pro Account' : 'Sign up')}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Wrap SignupForm with Suspense for useSearchParams
export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <SignupForm />
    </Suspense>
  );
} 