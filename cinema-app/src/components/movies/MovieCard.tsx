'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock } from 'lucide-react';
import { CardSpotlight } from '@/components/aceternity/card-spotlight';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/utils';
import type { Movie } from '@/lib/types';

const PLACEHOLDER_POSTERS = [
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop',
];

export function MovieCard({ movie, index = 0 }: { movie: Movie; index?: number }) {
  const poster = movie.posterUrl || PLACEHOLDER_POSTERS[index % PLACEHOLDER_POSTERS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/movies/${movie.id}`}>
        <CardSpotlight className="h-full">
          <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl">
            <img
              src={poster}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent" />
            <div className="absolute right-2 top-2">
              <Badge variant="default" className="bg-cinema-amber/90 text-cinema-bg">
                <Star className="mr-1 h-3 w-3 fill-current" />
                {movie.rating.toFixed(1)}
              </Badge>
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <Badge variant="secondary" className="bg-cinema-bg/80 text-cinema-muted">
                <Clock className="mr-1 h-3 w-3" />
                {formatDuration(movie.durationMin)}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <h3 className="line-clamp-1 font-display text-xl text-white">{movie.title}</h3>
            <p className="mt-1 text-xs text-cinema-muted">{movie.genre}</p>
          </div>
        </CardSpotlight>
      </Link>
    </motion.div>
  );
}
