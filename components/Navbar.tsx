'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Lost Items', href: '/lost' },
  { label: 'Found Items', href: '/found' },
  { label: 'Post Lost', href: '/post-lost' },
  { label: 'Post Found', href: '/post-found' },
  { label: 'About', href: '/about' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  // Sync theme state with DOM class
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (systemPrefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border glass transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
              <Compass className="h-6 w-6 animate-pulse" />
              <span>Campus Find</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive ? "text-primary font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Dashboard</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
