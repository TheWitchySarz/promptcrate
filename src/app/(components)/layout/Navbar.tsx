'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Settings, User, UploadCloud, LayoutDashboard, Search, ShoppingCart, Briefcase, Zap, ShieldCheck, BarChart3 } from 'lucide-react';
import { useAuth } from '../../(contexts)/AuthContext'; // Import useAuth

// type UserRole = 'free' | 'pro' | 'enterprise' | null; // Removed, now in AuthContext

const Navbar = () => {
  const { isLoggedIn, userRole, handleMockLogin, handleMockLogout } = useAuth(); // Use context
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // Removed
  // const [userRole, setUserRole] = useState<UserRole>(null); // Removed
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // const MOCK_INITIAL_LOGGED_IN_STATE = false; // Removed
  // const MOCK_INITIAL_USER_ROLE: UserRole = 'free'; // Removed

  // useEffect(() => { // Removed, initial state handled in context
  //   if (MOCK_INITIAL_LOGGED_IN_STATE) {
  //     setIsLoggedIn(true);
  //     setUserRole(MOCK_INITIAL_USER_ROLE);
  //   }
  // }, []);

  // const handleMockLogin = (role: UserRole) => { // Removed
  //   if (role) {
  //     setIsLoggedIn(true);
  //     setUserRole(role);
  //   }
  // };

  // const handleMockLogout = () => { // Removed
  //   setIsLoggedIn(false);
  //   setUserRole(null);
  //   setIsAccountDropdownOpen(false); 
  //   setIsMobileMenuOpen(false);
  // };

  const toggleAccountDropdown = () => setIsAccountDropdownOpen(!isAccountDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavLinks = () => {
    if (!isLoggedIn) {
      return (
        <>
          <li><Link href="/#features" className="hover:text-purple-400 transition-colors">Features</Link></li>
          <li><Link href="/#mockup" className="hover:text-purple-400 transition-colors">Product</Link></li>
          <li><Link href="/#pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
        </>
      );
    }
    switch (userRole) {
      case 'free':
        return (
          <>
            <li><Link href="/" className="hover:text-purple-400 transition-colors">Home</Link></li>
            <li><Link href="/features" className="hover:text-purple-400 transition-colors">Features</Link></li>
            <li><Link href="/marketplace" className="hover:text-purple-400 transition-colors">Marketplace</Link></li>
            <li><Link href="/#pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
            <li><Link href="/app/editor" className="hover:text-purple-400 transition-colors">Prompt Editor</Link></li>
          </>
        );
      case 'pro':
        return (
          <>
            <li><Link href="/" className="hover:text-purple-400 transition-colors">Home</Link></li>
            <li><Link href="/app/editor" className="hover:text-purple-400 transition-colors">Prompt Editor</Link></li>
            <li><Link href="/marketplace" className="hover:text-purple-400 transition-colors">Marketplace</Link></li>
            <li><Link href="/app/my-library" className="hover:text-purple-400 transition-colors">My Library</Link></li>
            <li><Link href="/upload" className="hover:text-purple-400 transition-colors">Upload Prompt</Link></li>
          </>
        );
      case 'enterprise':
        return (
          <>
            <li><Link href="/" className="hover:text-purple-400 transition-colors">Home</Link></li>
            <li><Link href="/app/editor" className="hover:text-purple-400 transition-colors">Prompt Editor</Link></li>
            <li><Link href="/app/team-library" className="hover:text-purple-400 transition-colors">Team Library</Link></li>
            <li><Link href="/app/analytics" className="hover:text-purple-400 transition-colors">Analytics</Link></li>
            <li><Link href="/marketplace" className="hover:text-purple-400 transition-colors">Marketplace</Link></li>
            <li><Link href="/upload" className="hover:text-purple-400 transition-colors">Upload Prompt</Link></li>
            <li><Link href="/admin/console" className="hover:text-purple-400 transition-colors">Admin Console</Link></li>
          </>
        );
      default:
        return null;
    }
  };

  const AccountDropdownLinks = () => {
    if (!isLoggedIn) return null;

    const commonLinks = (
      <>
        <Link href="/account/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
          <Settings className="mr-2 h-4 w-4" /> Account Settings
        </Link>
        <button
          onClick={() => {
            handleMockLogout(); // Use context function
            setIsAccountDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
        >
          <LogOut className="mr-2 h-4 w-4" /> Log Out
        </button>
      </>
    );

    switch (userRole) {
      case 'free':
        return (
          <div className="py-1 rounded-md bg-white shadow-xs">
            <div className="px-4 py-3">
              <p className="text-sm leading-5">Signed in as</p>
              <p className="text-sm font-medium leading-5 text-gray-900 truncate">Free User</p>
            </div>
            <div className="border-t border-gray-100"></div>
            <Link href="/" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Home
            </Link>
            <Link href="/features" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <Zap className="mr-2 h-4 w-4"/> Features
            </Link>
            <Link href="/marketplace" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <ShoppingCart className="mr-2 h-4 w-4"/> Marketplace
            </Link>
             <Link href="/#pricing" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <Briefcase className="mr-2 h-4 w-4"/> Pricing
            </Link>
            <Link href="/app/editor" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <Zap className="mr-2 h-4 w-4"/> Prompt Editor
            </Link>
            <div className="border-t border-gray-100"></div>
            {commonLinks}
          </div>
        );
      case 'pro':
        return (
          <div className="py-1 rounded-md bg-white shadow-xs">
            <div className="px-4 py-3">
              <p className="text-sm leading-5">Signed in as</p>
              <p className="text-sm font-medium leading-5 text-gray-900 truncate">Pro Plan User</p>
            </div>
            <div className="border-t border-gray-100"></div>
            <Link href="/" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Home
            </Link>
             <Link href="/app/editor" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <Zap className="mr-2 h-4 w-4"/> Prompt Editor
            </Link>
            <Link href="/marketplace" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <ShoppingCart className="mr-2 h-4 w-4"/> Marketplace
            </Link>
             <Link href="/app/my-library" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <User className="mr-2 h-4 w-4"/> My Library
            </Link>
            <Link href="/upload" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <UploadCloud className="mr-2 h-4 w-4"/> Upload Prompt
            </Link>
            <div className="border-t border-gray-100"></div>
            {commonLinks}
          </div>
        );
      case 'enterprise':
        return (
          <div className="py-1 rounded-md bg-white shadow-xs">
            <div className="px-4 py-3">
              <p className="text-sm leading-5">Signed in as</p>
              <p className="text-sm font-medium leading-5 text-gray-900 truncate">Enterprise Plan User</p>
            </div>
            <div className="border-t border-gray-100"></div>
             <Link href="/" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Home
            </Link>
             <Link href="/app/editor" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <Zap className="mr-2 h-4 w-4"/> Prompt Editor
            </Link>
             <Link href="/app/team-library" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <Briefcase className="mr-2 h-4 w-4"/> Team Library
            </Link>
             <Link href="/app/analytics" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <BarChart3 className="mr-2 h-4 w-4"/> Analytics
            </Link>
            <Link href="/marketplace" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <ShoppingCart className="mr-2 h-4 w-4"/> Marketplace
            </Link>
            <Link href="/upload" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <UploadCloud className="mr-2 h-4 w-4"/> Upload Prompt
            </Link>
            <Link href="/admin/console" className="md:hidden flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                <ShieldCheck className="mr-2 h-4 w-4"/> Admin Console
            </Link>
            <div className="border-t border-gray-100"></div>
            {commonLinks}
          </div>
        );
      default:
        return null;
    }
  };

  // Auth Test Buttons - only show in development
  const AuthTestButtons = () => {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }
    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 p-3 rounded-lg shadow-xl z-50 text-xs text-white">
            <p className="font-bold mb-2">Auth Test Controls (Dev Only)</p>
            <div className="space-y-2">
                <button onClick={() => handleMockLogin('free')} className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded w-full">Login as Free</button>
                <button onClick={() => handleMockLogin('pro')} className="bg-green-500 hover:bg-green-600 px-2 py-1 rounded w-full">Login as Pro</button>
                <button onClick={() => handleMockLogin('enterprise')} className="bg-purple-500 hover:bg-purple-600 px-2 py-1 rounded w-full">Login as Enterprise</button>
                <button onClick={handleMockLogout} className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded w-full">Logout</button>
            </div>
            <p className="mt-2">Status: {isLoggedIn ? `Logged in as ${userRole}` : 'Logged out'}</p>
        </div>
    );
};

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-2xl font-bold text-purple-600">
              PromptCrate
            </Link>
            <div className="hidden md:block">
              <ul className="ml-10 flex items-baseline space-x-4">
                <NavLinks />
              </ul>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {!isLoggedIn ? (
                <div className="space-x-2">
                  <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                    Log in
                  </Link>
                  <Link href="/signup" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
                    Sign up
                  </Link>
                </div>
              ) : (
                <>
                  {userRole === 'free' && (
                    <Link
                      href="/#pricing"
                      className="mr-3 px-5 py-2 text-base font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-md hover:from-pink-600 hover:to-purple-700 transition-all flex items-center"
                    >
                      <Zap size={20} className="mr-1.5" /> Upgrade to Pro
                    </Link>
                  )}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleAccountDropdown}
                      className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      aria-expanded={isAccountDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          <User size={20}/>
                      </div>
                      <ChevronDown size={16} className={`ml-1 text-gray-500 transition-transform duration-200 ${isAccountDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isAccountDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="user-menu-button"
                        >
                          <AccountDropdownLinks />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden" 
            id="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <ul className="space-y-1">
                <NavLinks />
              </ul>
              {!isLoggedIn && (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex flex-col space-y-2">
                    <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                      Log in
                    </Link>
                    <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-700">
                      Sign up
                    </Link>
                  </div>
                </div>
              )}
               {isLoggedIn && (
                <div className="pt-4 pb-3 border-t border-gray-200">
                    <div className="px-2">
                        <AccountDropdownLinks />
                    </div>
                </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {process.env.NODE_ENV === 'development' && <AuthTestButtons />} 
    </nav>
  );
};

export default Navbar;