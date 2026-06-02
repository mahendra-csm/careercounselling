'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/brand/Logo';

/**
 * Public sign-up is disabled by product decision: accounts are created only by
 * taking the assessment (the email + password collected there become the login).
 * This page just forwards anyone who lands on /sign-up to the assessment.
 */
export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/assessment');
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Logo size={38} />
        <h1 className="text-xl font-extrabold text-ink mt-6 mb-1">Let&apos;s get you started</h1>
        <p className="text-ink-3 text-sm mb-6">
          Your account is created when you take the assessment. Taking you there now…
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-red mx-auto" />
        <p className="text-xs text-ink-4 mt-6">
          Already have an account?{' '}
          <a href="/sign-in" className="text-red font-semibold hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
