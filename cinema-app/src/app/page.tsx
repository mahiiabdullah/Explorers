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
import { api, endpoints } from '@/lib/api';
import { ErrorState, LoadingState } from '@/components/shared/ErrorState';
import type { Movie } from '@/lib/types';

async function fetchFeaturedMovies(): Promise<Movie[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/movies`, {
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) return [];
  return (json.data ?? []).slice(0, 6);
}

export default async function HomePage() {
  let featuredMovies: Movie[] = [];
  let fetchError: string | null = null;
  try {
    featuredMovies = await fetchFeaturedMovies();
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Failed to load movies';
  }

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
            <br />
            <span className="text-cinema-gradient">YOUR STORY.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-cinema-muted md:text-xl">
            Skip the line. Lock your seats in seconds. Get instant confirmation with our real-time booking engine — no conflicts, no surprises.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/movies">
              <ShimmerButton className="px-8 py-4 text-lg">
                Browse Movies <ArrowRight className="ml-2 inline h-5 w-5" />
              </ShimmerButton>
            </Link>
            <Link href="/movies">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                View Showtimes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED MOVIES MARQUEE */}
      <section className="border-y border-cinema-border bg-cinema-surface/30 py-12">
        <div className="container mb-8">
          <h2 className="text-center font-display text-3xl text-cinema-amber md:text-4xl">NOW SHOWING</h2>
          <p className="mt-2 text-center text-sm text-cinema-muted">Real movies from the live backend</p>
        </div>

        {fetchError ? (
          <div className="container">
            <ErrorState
              title="Could not reach the cinema backend"
              description={fetchError}
            />
          </div>
        ) : featuredMovies.length === 0 ? (
          <div className="container">
            <LoadingState message="Loading featured movies…" />
          </div>
        ) : (
          <Marquee pauseOnHover className="[--duration:40s]">
            {featuredMovies.map((m, index) => (
              <div key={m.id} className="w-48 flex-shrink-0">
                <MovieCard movie={m} index={index} />
              </div>
            ))}
          </Marquee>
        )}
      </section>

      {/* FEATURES BENTO */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl text-white md:text-5xl">WHY CINEMA?</h2>
            <p className="mt-3 text-cinema-muted">Built for movie lovers, engineered for peace of mind</p>
          </div>

          <BentoGrid>
            <BentoGridItem
              title="Real-time Locking"
              description="See seats disappear the moment someone holds them. No double bookings, ever."
              icon={<Zap className="h-6 w-6 text-cinema-amber" />}
              className="md:col-span-2"
            />
            <BentoGridItem
              title="10-second Checkout"
              description="Hold, pay, done. UPI, cards, wallets — all supported."
              icon={<ShieldCheck className="h-6 w-6 text-cinema-amber" />}
            />
            <BentoGridItem
              title="< 3s Confirm"
              description="Payment confirmation delivered in under three seconds on average."
              icon={<Sparkles className="h-6 w-6 text-cinema-amber" />}
            />
            <BentoGridItem
              title="2M+ Bookings"
              description="Powering cinema chains across the country."
              icon={<AnimatedNumber value={2134567} className="text-cinema-amber" />}
              className="md:col-span-2"
            />
          </BentoGrid>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <BackgroundGradient className="rounded-3xl p-12 md:p-16">
            <div className="text-center">
              <h2 className="font-display text-4xl text-white md:text-5xl">READY TO BOOK?</h2>
              <p className="mt-4 text-cinema-muted">
                Browse today's lineup and grab your perfect seats.
              </p>
              <Link href="/movies" className="mt-8 inline-block">
                <ShimmerButton className="px-10 py-4 text-lg">
                  See All Movies <ArrowRight className="ml-2 inline h-5 w-5" />
                </ShimmerButton>
              </Link>
            </div>
          </BackgroundGradient>
        </div>
      </section>
    </div>
  );
}