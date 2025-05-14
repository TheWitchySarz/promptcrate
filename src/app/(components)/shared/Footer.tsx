'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 text-center bg-white mt-16">
      <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} PromptCrate. All rights reserved.</p>
    </footer>
  );
} 