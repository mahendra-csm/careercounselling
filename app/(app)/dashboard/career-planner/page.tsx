import Link from 'next/link';

export default function CareerPlannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-4">Career Planner</h1>
      <p className="text-sm text-ink-3 mb-6">A simple planner to explore streams, activities and next steps for students.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-line rounded-xl p-4">
          <h3 className="font-semibold">Explore streams</h3>
          <p className="text-xs text-ink-4 mt-2">Science, Commerce, Arts — learn what each stream offers and suggested subjects.</p>
        </div>

        <div className="bg-white border border-line rounded-xl p-4">
          <h3 className="font-semibold">Mini projects</h3>
          <p className="text-xs text-ink-4 mt-2">Small practical tasks for each stream to build confidence and clarity.</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/dashboard" className="text-red text-sm font-semibold">← Back to dashboard</Link>
      </div>
    </div>
  );
}
