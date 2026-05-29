import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />

      {/* Logo bar */}
      <section className="py-10 bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium text-ink-4 uppercase tracking-widest mb-6">
            Trusted by professionals from
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {['Google', 'Stripe', 'Airbnb', 'Notion', 'Figma', 'Spotify'].map((company) => (
              <span key={company} className="text-ink-3 font-bold text-lg tracking-tight opacity-50">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />

      {/* CTA Banner */}
      <section className="py-20 gradient-brand">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to see where you really stand?
          </h2>
          <p className="text-red-soft text-lg mb-8">
            14,200 professionals have already gotten their career reality check. Yours takes 5 minutes.
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-red font-bold px-8 py-4 rounded-xl hover:bg-red-soft transition-all text-base"
          >
            Show me my gaps →
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
