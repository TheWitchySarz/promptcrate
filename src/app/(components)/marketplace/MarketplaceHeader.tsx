'use client';

import React from 'react';
import Link from 'next/link';

interface MarketplaceHeaderProps {
  pageType?: 'marketplace' | 'upload';
}

export default function MarketplaceHeader({ pageType }: MarketplaceHeaderProps) {
  const isUploadPage = pageType === 'upload';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-purple-600">
            PromptCrate
          </Link>
          <nav className="ml-10 space-x-4 hidden md:flex">
            <Link href="/features" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/app" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Dashboard
            </Link>
          </nav>
        </div>
        <Link 
          href={isUploadPage ? '/marketplace' : '/upload'} 
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
        >
          {isUploadPage ? 'Back to Marketplace' : 'Sell a Prompt'}
        </Link>
      </div>
    </header>
  );
} 