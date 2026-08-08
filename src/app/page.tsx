import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextGenerateEffect } from '@/components/aceternity/text-generate-effect';
import { BackgroundGradient } from '@/components/aceternity/background-gradient';
import { BentoGrid, BentoGridItem } from '@/components/magicui/bento-grid';
import { AnimatedNumber } from '@/components/magicui/animated-number';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { MovieCard } from '@/components/movies/MovieCard';
import { Marquee } from '@/components/magicui/marquee';
import type { Movie } from '@/lib/types';

// Mock data — replace with backend fetch on integration
const featuredMovies: Movie[] = [
  { id: 1, title: 'Dune Part Three', description: 'The epic continues.', posterUrl: '', durationMin: 165, rating: 9.1, genre: 'Sci-Fi', releaseDate: '2026-08-15' },
  { id: 2, title: 'Inception 2', description: 'Dreams within dreams.', posterUrl: '', durationMin: 148, rating: 8.4, genre: 'Sci-Fi', releaseDate: '2026-08-20' },
  { id: 3, title: 'The Dark Knight Returns', description: 'The legend rises.', posterUrl: '', durationMin: 152, rating: 9.0, genre: 'Action', releaseDate: '2026-08-22' },
  { id: 4, title: 'Interstellar II', description: 'Beyond the stars.', posterUrl: '', durationMin: 169, rating: 8.8, genre: 'Sci-Fi', releaseDate: '2026-08-25' },
  { id: 5, title: 'Oppenheimer', description: 'A story of creation.', posterUrl: '', durationMin: 180, rating: 8.6, genre: 'Drama', releaseDate: '2026-08-28' },
  { id: 6, title: 'Tenet', description: 'Time is the weapon.', posterUrl: '', durationMin: 150, rating: 7.9, genre: 'Action', releaseDate: '2026-08-30' },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-[90vh] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-cinema-bg via-cinema-surface to-cinema-bg" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cinema-amber/10 blur-3xl" />
        </div>

        <div className="container flex min-h-[90vh] flex-col items-center justify-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cinema-amber/30 bg-cinema-amber/5 px-4 py-1.5 text-xs text-cinema-amber">
            <Sparkles className="h-3 w-3" />
            Real-time seat booking · Zero conflicts
          </div>

          <h1 className="font-display text-6xl leading-[0.9] tracking-wider text-white md:text-9xl">
            <TextGenerateEffect words="YOUR SEAT." />
            <span className="text-cinema-gradient">YOUR STORY.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-balance text-lg text-cinema-muted md:text-xl">
            Browse movies, pick your perfect seat in real-time, and step into the story.
            No double-bookings. No friction. Just cinema.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/movies">
              <ShimmerButton>
                Browse Movies
                <ArrowRight className="h-4 w-4" />
              </ShimmerButton>
            </Link>
            <Link href="/movies">
              <Button variant="outline" size="lg">
                View Showtimes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* NOW SHOWING MARQUEE */}
      <section className="border-y border-cinema-border/40 bg-cinema-surface/30 py-12">
        <div className="container mb-6">
          <h2 className="font-display text-3xl text-cinema-amber">NOW SHOWING</h2>
        </div>
        <Marquee pauseOnHover className="[--duration:30s]">
          {featuredMovies.map((m) => (
            <div key={m.id} className="w-48 flex-shrink-0">
              <MovieCard movie={m} index={m.id} />
            </div>
          ))}
        </Marquee>
      </section>

      {/* FEATURED BENTO */}
      <section className="container py-24">
        <div className="mb-12 text-center">
          <h2 className="font-display text-5xl text-cinema-gradient">FEATURED THIS WEEK</h2>
          <p className="mt-4 text-cinema-muted">Hand-picked blockbusters playing near you</p>
        </div>
        <BentoGrid>
          {featuredMovies[0] && (
            <BentoGridItem
              className="md:col-span-2 md:row-span-2"
              header={<MovieCard movie={featuredMovies[0]} />}
              title={featuredMovies[0].title}
              description={featuredMovies[0].description ?? ''}
            />
          )}
          {featuredMovies.slice(1, 5).map((m) => (
            <BentoGridItem
              key={m.id}
              header={<MovieCard movie={m} />}
              title={m.title}
              description={m.description ?? ''}
            />
          ))}
        </BentoGrid>
      </section>

      {/* WHY US */}
      <section className="border-y border-cinema-border/40 bg-cinema-surface/40 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="font-display text-5xl text-white">WHY CINEMA</h2>
            <p className="mt-4 text-cinema-muted">Built for movie lovers. Engineered for perfection.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <BackgroundGradient className="rounded-3xl p-6">
              <Zap className="h-8 w-8 text-cinema-amber" />
              <h3 className="mt-4 font-display text-2xl text-white">Real-time</h3>
              <p className="mt-2 text-sm text-cinema-muted">
                See seat availability update live as others book. No refresh needed.
              </p>
            </BackgroundGradient>
            <BackgroundGradient className="rounded-3xl p-6">
              <ShieldCheck className="h-8 w-8 text-cinema-amber" />
              <h3 className="mt-4 font-display text-2xl text-white">Zero Conflicts</h3>
              <p className="mt-2 text-sm text-cinema-muted">
                Database-level locking guarantees no double-booking, even under heavy load.
              </p>
            </BackgroundGradient>
            <BackgroundGradient className="rounded-3xl p-6">
              <Sparkles className="h-8 w-8 text-cinema-amber" />
              <h3 className="mt-4 font-display text-2xl text-white">Auto Release</h3>
              <p className="mt-2 text-sm text-cinema-muted">
                Held seats release automatically if you don't pay in time. Fair for everyone.
              </p>
            </BackgroundGradient>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container py-24">
        <div className="grid gap-8 text-center md:grid-cols-3">
          <div>
            <div className="font-display text-6xl text-cinema-amber">
              <AnimatedNumber value={50000} suffix="+" />
            </div>
            <div className="mt-2 text-sm text-cinema-muted">Tickets booked</div>
          </div>
          <div>
            <div className="font-display text-6xl text-cinema-amber">
              <AnimatedNumber value={120} suffix="+" />
            </div>
            <div className="mt-2 text-sm text-cinema-muted">Screens live</div>
          </div>
          <div>
            <div className="font-display text-6xl text-cinema-amber">
              <AnimatedNumber value={4.9} suffix="★" />
            </div>
            <div className="mt-2 text-sm text-cinema-muted">User rating</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="overflow-hidden rounded-3xl border border-cinema-amber/30 bg-gradient-to-br from-cinema-surface to-cinema-bg p-12 text-center">
          <h2 className="font-display text-5xl text-cinema-gradient">READY TO WATCH?</h2>
          <p className="mx-auto mt-4 max-w-xl text-cinema-muted">
            Pick your movie. Pick your seat. Step into the story.
          </p>
          <div className="mt-8">
            <Link href="/movies">
              <ShimmerButton>
                Browse Movies
                <ArrowRight className="h-4 w-4" />
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
