'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../(components)/layout/Navbar';
import Footer from '../(components)/shared/Footer';
import { Mail, ArrowLeft } from 'lucide-react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ForgotPasswordPage() {
  // const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handlePasswordResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    console.log('Requesting password reset for:', email);
    // Placeholder for Supabase password reset
    // const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: `${window.location.origin}/reset-password`, // Your page to handle the new password form
    // });

    // if (resetError) {
    //   setError(resetError.message);
    // } else {
    //   setMessage('If an account exists for this email, a password reset link has been sent.');
    //   setEmail('');
    // }
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    setMessage('If an account exists for this email, a password reset link has been sent. (Mocked response)');
    setEmail('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset Your Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the email address associated with your account, and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handlePasswordResetRequest}>
            <div>
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
                  className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  disabled={loading}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center py-2">{error}</p>}
            {message && <p className="text-sm text-green-600 text-center py-2">{message}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Password Reset Email'}
              </button>
            </div>
          </form>

          <div className="text-sm text-center mt-6">
            <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500 flex items-center justify-center">
              <ArrowLeft size={16} className="mr-1" />
              Back to Log in
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 