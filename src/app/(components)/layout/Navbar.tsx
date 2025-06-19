'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Settings, User, UploadCloud, LayoutDashboard, Search, ShoppingCart, Briefcase, Zap, ShieldCheck, BarChart3 } from 'lucide-react';
import { useAuth } from '../../(contexts)/AuthContext'; // Import useAuth

// type UserRole = 'free' | 'pro' | 'enterprise' | null; // Removed, now in AuthContext

const Navbar = () => {
  const { isLoggedIn, userRole, user, signOut, isLoading } = useAuth(); // Use context
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

  const handleLogout = async () => {
    await signOut();
    setIsAccountDropdownOpen(false);
    setIsMobileMenuOpen(false);
    // router.push('/'); // Optional: redirect to home after logout, handled by AuthContext changes too
  };

  const NavLinks = () => {
    if (!isLoggedIn) {
      return (
        <>
          <li><Link href="/features" className="text-gray-900 hover:text-purple-400 transition-colors">Features</Link></li>
          <li><Link href="/#mockup" className="text-gray-900 hover:text-purple-400 transition-colors">Product</Link></li>
          <li><Link href="/#pricing" className="text-gray-900 hover:text-purple-400 transition-colors">Pricing</Link></li>
        </>
      );
    }
    switch (userRole) {
      case 'free':
        return (
          <>
            <li><Link href="/" className="text-gray-900 hover:text-purple-400 transition-colors">Home</Link></li>
            <li><Link href="/features" className="text-gray-900 hover:text-purple-400 transition-colors">Features</Link></li>
            <li><Link href="/app/editor" className="text-gray-900 hover:text-purple-400 transition-colors">Prompt Editor</Link></li>
            <li><Link href="/marketplace" className="text-gray-900 hover:text-purple-400 transition-colors">Marketplace</Link></li>
            <li><Link href="/blog" className="text-gray-900 hover:text-purple-400 transition-colors">Blog</Link></li>
            <li><Link href="/#pricing" className="text-gray-900 hover:text-purple-400 transition-colors">Pricing</Link></li>
          </>
        );
      case 'pro':
        return (
          <>
            <li><Link href="/" className="text-gray-900 hover:text-purple-400 transition-colors">Home</Link></li>
            <li><Link href="/app/editor" className="text-gray-900 hover:text-purple-400 transition-colors">Prompt Editor</Link></li>
            <li><Link href="/marketplace" className="text-gray-900 hover:text-purple-400 transition-colors">Marketplace</Link></li>
            <li><Link href="/blog" className="text-gray-900 hover:text-purple-400 transition-colors">Blog</Link></li>
            <li><Link href="/app/my-library" className="text-gray-900 hover:text-purple-400 transition-colors">My Library</Link></li>
            <li><Link href="/upload" className="text-gray-900 hover:text-purple-400 transition-colors">Upload Prompt</Link></li>
          </>
        );
      case 'enterprise':
        return (
          <>
            <li><Link href="/" className="text-gray-900 hover:text-purple-400 transition-colors">Home</Link></li>
            <li><Link href="/app/editor" className="text-gray-900 hover:text-purple-400 transition-colors">Prompt Editor</Link></li>
            <li><Link href="/app/team-library" className="text-gray-900 hover:text-purple-400 transition-colors">Team Library</Link></li>
            <li><Link href="/app/analytics" className="text-gray-900 hover:text-purple-400 transition-colors">Analytics</Link></li>
            <li><Link href="/marketplace" className="text-gray-900 hover:text-purple-400 transition-colors">Marketplace</Link></li>
            <li><Link href="/blog" className="text-gray-900 hover:text-purple-400 transition-colors">Blog</Link></li>
            <li><Link href="/upload" className="text-gray-900 hover:text-purple-400 transition-colors">Upload Prompt</Link></li>
            <li><Link href="/admin/console" className="text-gray-900 hover:text-purple-400 transition-colors">Admin Console</Link></li>
          </>
        );
      default:
        return null;
    }
  };

  const AccountDropdownLinks = () => {
    if (!isLoggedIn) return null;

    // Determine user display name - placeholder, enhance with profile data later
    const userDisplayName = user?.email?.split('@')[0] || 'User';
    const displayRole = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) + ' Plan' : 'User';

    const commonLinks = (
      <>
        <Link href="/account/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
          <Settings className="mr-2 h-4 w-4" /> Account Settings
        </Link>
        <button
          onClick={handleLogout} // Use the new handleLogout function
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
        >
          <LogOut className="mr-2 h-4 w-4" /> Log Out
        </button>
      </>
    );

    // Mobile links (can be combined with desktop or handled separately in mobile menu)
    const mobileNavLinks = (
        <div className="border-t border-gray-100 pt-2 pb-3 space-y-1">
            {userRole === 'free' && (
                <>
                    <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Home</Link>
                    <Link href="/features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Features</Link>
                    <Link href="/marketplace" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Marketplace</Link>
                    <Link href="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Blog</Link>
                    <Link href="/#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Pricing</Link>
                    <Link href="/app/editor" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Prompt Editor</Link>
                </>
            )}
            {userRole === 'pro' && (
                <>
                    <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Home</Link>
                    <Link href="/app/editor" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Prompt Editor</Link>
                    <Link href="/marketplace" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Marketplace</Link>
                    <Link href="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Blog</Link>
                    <Link href="/app/my-library" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">My Library</Link>
                    <Link href="/upload" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Upload Prompt</Link>
                </>
            )}
            {userRole === 'enterprise' && (
                 <>
                    <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Home</Link>
                    <Link href="/app/editor" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Prompt Editor</Link>
                    <Link href="/app/team-library" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Team Library</Link>
                    <Link href="/app/analytics" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Analytics</Link>
                    <Link href="/marketplace" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Marketplace</Link>
                    <Link href="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Blog</Link>
                    <Link href="/upload" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Upload Prompt</Link>
                    <Link href="/admin/console" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Admin Console</Link>
                </>
            )}
        </div>
    );

    return (
      <div className="py-1 rounded-md bg-white shadow-xs ring-1 ring-black ring-opacity-5">
        <div className="px-4 py-3">
          <p className="text-sm leading-5">Signed in as</p>
          <p className="text-sm font-medium leading-5 text-gray-900 truncate">
            {userDisplayName} ({displayRole})
          </p>
        </div>
        <div className="border-t border-gray-100"></div>
        {/* Mobile specific links from NavLinks can be integrated here for mobile dropdown */} 
        {/* For now, keeping commonLinks for account actions */} 
        {commonLinks}
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
              {isLoading ? (
                <div className="animate-pulse h-8 w-20 bg-gray-200 rounded-md"></div>
              ) : isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleAccountDropdown} 
                    className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 p-1 hover:bg-gray-100"
                    aria-label="User menu" 
                    aria-haspopup="true"
                  >
                    <User className="h-6 w-6 text-gray-500" /> 
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </button>
                  <AnimatePresence>
                    {isAccountDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <AccountDropdownLinks />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-x-3">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                    Log In
                  </Link>
                  <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button 
              onClick={toggleMobileMenu} 
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              aria-expanded="false"
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

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLinks /> {/* Display NavLinks directly for mobile, as per original structure, assuming it handles logged in/out states */}
            </div>
            {/* Account actions for mobile if logged in */}
            {isLoggedIn && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                     <User className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-gray-800">{user?.email?.split('@')[0] || 'User'}</div>
                    <div className="text-sm font-medium leading-none text-gray-500 capitalize">{userRole ? userRole + ' Plan' : (user?.email || 'View Profile')}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link href="/account/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout} // Use the new handleLogout function
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
             {!isLoggedIn && (
                <div className="pt-4 pb-3 border-t border-gray-200 px-2">
                     <Link href="/login" className="block w-full text-left px-3 py-2 mb-2 rounded-md text-base font-medium text-purple-600 bg-purple-100 hover:bg-purple-200">
                        Log In
                    </Link>
                    <Link href="/signup" className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-700">
                        Sign Up
                    </Link>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;