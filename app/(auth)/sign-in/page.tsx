'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn, ADMIN_EMAIL } from '@/lib/firebase';
import Logo from '@/components/brand/Logo';

const schema = z.object({
  email: z.string().email('That email looks off — try again?'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const sess = await signIn(data.email, data.password);
      router.push(sess.email.toLowerCase() === ADMIN_EMAIL ? '/admin' : '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That email or password doesn't match — try again?");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6">
            <Logo size={38} />
          </Link>
          <h1 className="text-2xl font-extrabold text-ink mb-1">Welcome back</h1>
          <p className="text-ink-3 text-sm">Sign in to your career dashboard</p>
        </div>

        <div className="bg-white rounded-2xl border border-line shadow-md p-8">
          {error && (
            <div className="bg-red-soft border border-red-line rounded-xl p-3 mb-5 text-sm text-red font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-ink-2 block mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all text-sm"
              />
              {errors.email && (
                <p className="text-red text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-ink-2 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red text-white font-semibold py-3.5 rounded-xl hover:bg-red-dark transition-all shadow-glow hover:shadow-glow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in →'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-ink-3 mt-5">
            New here?{' '}
            <Link href="/assessment" className="text-red font-semibold hover:underline">
              Start your free assessment
            </Link>
          </p>
          <p className="text-center text-xs text-ink-4 mt-2">
            Your account is created when you take the assessment — sign in with the email &amp; password you used there.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
