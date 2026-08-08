'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Film, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/movies', label: 'Movies' },
  { href: '/bookings', label: 'My Bookings' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Mocked auth — replace with useAuth() once backend is integrated
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cinema-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cinema-amber text-cinema-bg transition-transform group-hover:scale-110">
            <Film className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl tracking-wider text-cinema-gradient">CINEMA</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-cinema-amber',
                pathname === link.href ? 'text-cinema-amber' : 'text-cinema-muted',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/movies">Book Now</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-cinema-border/40 bg-background md:hidden">
          <nav className="container flex flex-col gap-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-cinema-muted hover:text-cinema-amber"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/movies">Book Now</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
