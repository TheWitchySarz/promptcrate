"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(contexts)/AuthContext";
import Navbar from "@/app/(components)/layout/Navbar";
import Footer from "@/app/(components)/shared/Footer";
import { ShieldCheck } from 'lucide-react';

export default function ChangePasswordPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login?message=Please login to change your password.");
    }
  }, [isLoggedIn, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setMessage("New password must be at least 8 characters long.");
      return;
    }
    setIsUpdating(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Password change submitted for user:", { currentPassword, newPassword });
    setMessage("Password change request submitted successfully! (Mocked)");
    setIsUpdating(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    // router.push("/account/settings?message=Password+updated+successfully"); // Optional: redirect after success
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-100">
          <p className="text-gray-700">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center bg-gray-100">
                <p className="text-gray-700">Redirecting to login...</p>
            </main>
            <Footer />
        </div>
    ); 
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <ShieldCheck className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">
            Change Your Password
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <input 
                type="password"
                id="current-password"
                name="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>

            <div>
              <label 
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input 
                type="password"
                id="new-password"
                name="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
               <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long.</p>
            </div>

            <div>
              <label 
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input 
                type="password"
                id="confirm-password"
                name="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
            
            {message && (
              <p className={`text-sm ${message.includes("successfully") ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}

            <div>
              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
} 