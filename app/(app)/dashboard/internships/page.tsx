import Link from 'next/link';

export default function InternshipsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-4">Internships & Opportunities</h1>
      <p className="text-sm text-ink-3 mb-6">Find short projects, volunteer tasks and guided activities suitable for school students.</p>

      <div className="space-y-3">
        <div className="bg-white border border-line rounded-xl p-4">
          <h3 className="font-semibold">School helper program</h3>
          <p className="text-xs text-ink-4 mt-1">Small mentorship tasks with local schools and clubs.</p>
        </div>

        <div className="bg-white border border-line rounded-xl p-4">
          <h3 className="font-semibold">Project buddies</h3>
          <p className="text-xs text-ink-4 mt-1">Team up with peers on short, guided projects.</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/dashboard" className="text-red text-sm font-semibold">← Back to dashboard</Link>
      </div>
    </div>
  );
}
