import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-[10rem] leading-none text-cinema-amber">404</h1>
      <p className="font-display text-3xl">REEL NOT FOUND</p>
      <p className="max-w-md text-cinema-muted">
        The page you're looking for has been cut from the final edit.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
