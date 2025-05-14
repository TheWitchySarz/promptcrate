"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(contexts)/AuthContext";
import Navbar from "@/app/(components)/layout/Navbar";
import Footer from "@/app/(components)/shared/Footer";

export default function BillingHistoryPage() {
  const { isLoggedIn, isLoading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login?message=Please login to view your billing history.");
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <p className="text-gray-700">Loading billing information...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center bg-gray-50">
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
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">
            Billing History
          </h1>
          <div className="space-y-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Invoices Yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                When you have subscriptions or make purchases, your invoices will appear here.
              </p>
              {(userRole === 'free' || !userRole) && (
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/#pricing')}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Explore Plans
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 