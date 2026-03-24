'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DarkModeToggle } from './DarkModeToggle';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Tasks', href: '/tasks' },
    { name: 'Planning', href: '/planning' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md" style={{background: 'var(--bg-nav)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}>
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">N</div>
            <span className="font-bold text-lg tracking-tight">Nexus</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          
          {/* Mobile Menu Hamburger Toggle */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu Container */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  pathname === link.href 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
