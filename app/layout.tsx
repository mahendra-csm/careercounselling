import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OneGrasp — AI Career Intelligence Platform',
  description:
    'Get your personalized AI-powered career analysis in 5 minutes. Discover skill gaps, top job matches, and a 90-day action plan tailored to you.',
  openGraph: {
    title: 'OneGrasp — AI Career Intelligence',
    description: 'Your personalized career roadmap, built by AI.',
    images: [{ url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${poppins.variable} font-poppins`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
