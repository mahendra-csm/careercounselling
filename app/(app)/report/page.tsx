'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ReportLayout from '@/components/report/ReportLayout';
import { Loader2 } from 'lucide-react';

function ReportContent() {
  const params = useSearchParams();
  const id = params.get('id') || undefined;
  return <ReportLayout reportId={id} />;
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-red animate-spin" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
