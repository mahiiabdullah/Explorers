import Link from 'next/link';
import { Film, Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-cinema-border/40 bg-cinema-surface/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cinema-amber text-cinema-bg">
                <Film className="h-5 w-5" />
              </div>
              <span className="font-display text-2xl text-cinema-gradient">CINEMA</span>
            </Link>
            <p className="max-w-md text-sm text-cinema-muted">
              Your seat. Your story. Book cinema tickets in real-time with the smoothest seat-selection experience.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-cinema-muted transition-colors hover:text-cinema-amber">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-cinema-muted transition-colors hover:text-cinema-amber">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-cinema-muted transition-colors hover:text-cinema-amber">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg">Explore</h4>
            <ul className="space-y-2 text-sm text-cinema-muted">
              <li><Link href="/movies" className="hover:text-cinema-amber">Movies</Link></li>
              <li><Link href="/bookings" className="hover:text-cinema-amber">My Bookings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg">Company</h4>
            <ul className="space-y-2 text-sm text-cinema-muted">
              <li><a href="#" className="hover:text-cinema-amber">About</a></li>
              <li><a href="#" className="hover:text-cinema-amber">Contact</a></li>
              <li><a href="#" className="hover:text-cinema-amber">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cinema-border/40 pt-6 text-center text-xs text-cinema-muted">
          © {new Date().getFullYear()} Cinema. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
