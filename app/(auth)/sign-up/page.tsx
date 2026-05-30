'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signUp } from '@/lib/firebase';
import Logo from '@/components/brand/Logo';

const schema = z.object({
  name: z.string().min(2, 'Tell us your name (at least 2 chars)'),
  email: z.string().email('That email looks off — try again?'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
});
type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
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
      await signUp(data.email, data.password, data.name);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Please try again.');
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
          <h1 className="text-2xl font-extrabold text-ink mb-1">Create your account</h1>
          <p className="text-ink-3 text-sm">This takes 30 seconds. Your analysis starts right after.</p>
        </div>

        <div className="bg-white rounded-2xl border border-line shadow-md p-8">
          {error && (
            <div className="bg-red-soft border border-red-line rounded-xl p-3 mb-5 text-sm text-red font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-ink-2 block mb-1.5">Full name</label>
              <input
                {...register('name')}
                type="text"
                placeholder="Alex Johnson"
                className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all text-sm"
              />
              {errors.name && (
                <p className="text-red text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-ink-2 block mb-1.5">Work email</label>
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
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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
              className="w-full bg-red text-white font-semibold py-3.5 rounded-xl hover:bg-red-dark transition-all shadow-glow hover:shadow-glow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "I'm ready →"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-ink-4 mt-4">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-ink-2">Terms</a> and{' '}
            <a href="#" className="underline hover:text-ink-2">Privacy Policy</a>.
          </p>

          <p className="text-center text-sm text-ink-3 mt-3">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-red font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
