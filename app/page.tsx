import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import ProgramSections from '@/components/landing/ProgramSections';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ProgramSections />
      <HowItWorks />
      <Features />
      <Testimonials />

      {/* CTA Banner */}
      <section className="py-20 gradient-brand">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to see your strengths and next steps?
          </h2>
          <p className="text-red-soft text-lg mb-8">
            Take the 6-section career assessment and get your student report instantly.
          </p>
          <a
            href="/assessment"
            className="inline-flex items-center gap-2 bg-white text-red font-bold px-8 py-4 rounded-xl hover:bg-red-soft transition-all text-base"
          >
            Take the quiz →
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
