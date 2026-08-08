'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardSpotlight } from '@/components/aceternity/card-spotlight';
import { toast } from '@/components/ui/toaster';
import { api, endpoints } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse } from '@/lib/types';

const signupSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    const { data: res, error } = await api.post<AuthResponse>(endpoints.signup(), data);
    if (error || !res) {
      toast({ type: 'error', title: 'Signup failed', description: error?.message ?? 'Try again' });
      setLoading(false);
      return;
    }
    setSession(res);
    api.setToken(res.token);
    toast({ type: 'success', title: 'Account created!' });
    router.push('/movies');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <CardSpotlight className="p-8">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cinema-amber text-cinema-bg">
              <Film className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-center font-display text-3xl text-white">JOIN CINEMA</h1>
          <p className="mt-2 text-center text-sm text-cinema-muted">
            Create your account in seconds
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cinema-muted" />
                <Input id="name" placeholder="John Doe" className="pl-10" {...register('name')} />
              </div>
              {errors.name && <p className="text-xs text-cinema-crimson">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cinema-muted" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-cinema-crimson">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cinema-muted" />
                <Input id="phone" placeholder="+91 98765 43210" className="pl-10" {...register('phone')} />
              </div>
              {errors.phone && <p className="text-xs text-cinema-crimson">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cinema-muted" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10" {...register('password')} />
              </div>
              {errors.password && <p className="text-xs text-cinema-crimson">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-cinema-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-cinema-amber hover:underline">
              Sign in
            </Link>
          </p>
        </CardSpotlight>
      </motion.div>
    </div>
  );
}
