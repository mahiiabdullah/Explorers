/**
 * Idempotent dev seed.
 * Run with: npx tsx prisma/seed.ts
 */
import { prisma } from '../src/app/lib/prisma';
import { Prisma } from '../src/generated/prisma/client';

const THEATRES = [
  { name: 'PVR Phoenix', city: 'Mumbai', screens: 2 },
  { name: 'INOX Nexus', city: 'Bangalore', screens: 1 },
];

const MOVIES = [
  {
    id: 'mv_interstellar',
    title: 'Interstellar: Return to the Stars',
    description: 'A new voyage beyond the stars. A father, a daughter, and the weight of time itself.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: 8.7,
    genre: 'DRAMA' as const,
    durationMins: 169,
  },
  {
    id: 'mv_heist',
    title: 'The Midnight Heist',
    description: 'A retired safecracker is pulled back in for one last impossible job.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qmDpIHWwUzLPPsApZsKxY24oijd.jpg',
    rating: 7.4,
    genre: 'ACTION' as const,
    durationMins: 118,
  },
  {
    id: 'mv_laugh',
    title: 'Laugh Lines',
    description: 'A struggling comedian and a reclusive author swap lives for a week.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    rating: 7.9,
    genre: 'COMEDY' as const,
    durationMins: 102,
  },
];

const SEAT_LAYOUT = (() => {
  // Rows A..J, columns 1..14 — 140 seats per screen.
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = 14;
  const out: { row: string; number: number; type: string }[] = [];
  for (const r of rows) {
    for (let n = 1; n <= cols; n += 1) {
      const type = r === 'I' || r === 'J' ? 'PREMIUM' : 'REGULAR';
      out.push({ row: r, number: n, type });
    }
  }
  return out;
})();

const HOUR_FROM_NOW = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000);

async function main() {
  console.log('Seeding…');

  // ---- user -----------------------------------------------------------
  const user = await prisma.user.upsert({
    where: { phone: '+910000000000' },
    update: {},
    create: {
      phone: '+910000000000',
      name: 'Demo User',
    },
  });
  console.log('user:', user.id);

  // ---- theatres + screens + seats -------------------------------------
  for (const t of THEATRES) {
    const theatre = await prisma.theatre.upsert({
      where: { id: `th_${t.name.replace(/\s+/g, '').toLowerCase()}` },
      update: { name: t.name, city: t.city },
      create: {
        id: `th_${t.name.replace(/\s+/g, '').toLowerCase()}`,
        name: t.name,
        city: t.city,
      },
    });

    for (let s = 0; s < t.screens; s += 1) {
      const screen = await prisma.screen.upsert({
        where: { id: `${theatre.id}_s${s + 1}` },
        update: { name: `Screen ${s + 1}` },
        create: {
          id: `${theatre.id}_s${s + 1}`,
          theatreId: theatre.id,
          name: `Screen ${s + 1}`,
        },
      });

      // upsert each seat — cheap because rows × cols is bounded.
      for (const seat of SEAT_LAYOUT) {
        await prisma.seat.upsert({
          where: {
            screenId_row_number: {
              screenId: screen.id,
              row: seat.row,
              number: seat.number,
            },
          },
          update: { type: seat.type },
          create: {
            screenId: screen.id,
            row: seat.row,
            number: seat.number,
            type: seat.type,
          },
        });
      }
    }
  }

  // ---- movies + showtimes + showSeats ---------------------------------
  for (const m of MOVIES) {
    const movie = await prisma.movie.upsert({
      where: { id: m.id },
      update: {
        title: m.title,
        description: m.description,
        posterUrl: m.posterUrl,
        rating: m.rating,
        genre: m.genre as Prisma.EnumGenreFilter,
        durationMins: m.durationMins,
      },
      create: {
        id: m.id,
        title: m.title,
        description: m.description,
        posterUrl: m.posterUrl,
        rating: m.rating,
        genre: m.genre as Prisma.EnumGenreFilter,
        durationMins: m.durationMins,
      },
    });

    const screens = await prisma.screen.findMany({ include: { theatre: true } });
    for (let i = 0; i < screens.length; i += 1) {
      const screen = screens[i];
      const startsAt = HOUR_FROM_NOW((i + 1) * 6);
      const basePrice = screen.name === 'Screen 1' ? 30000 : 42000; // ₹300 / ₹420 in paise

      const showtime = await prisma.showtime.upsert({
        where: { id: `${movie.id}_${screen.id}` },
        update: { startsAt, basePrice },
        create: {
          id: `${movie.id}_${screen.id}`,
          movieId: movie.id,
          screenId: screen.id,
          startsAt,
          basePrice,
        },
      });

      // create one ShowSeat per seat for this showtime if missing.
      const seatsForScreen = await prisma.seat.findMany({ where: { screenId: screen.id } });
      const existing = await prisma.showSeat.findMany({
        where: { showtimeId: showtime.id },
        select: { seatId: true },
      });
      const existingSet = new Set(existing.map((s) => s.seatId));
      const toCreate = seatsForScreen
        .filter((s) => !existingSet.has(s.id))
        .map((s) => ({
          showtimeId: showtime.id,
          seatId: s.id,
          status: 'AVAILABLE' as const,
        }));
      if (toCreate.length > 0) {
        await prisma.showSeat.createMany({ data: toCreate });
      }
    }
  }

  const counts = {
    movies: await prisma.movie.count(),
    theatres: await prisma.theatre.count(),
    screens: await prisma.screen.count(),
    seats: await prisma.seat.count(),
    showtimes: await prisma.showtime.count(),
    showSeats: await prisma.showSeat.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });