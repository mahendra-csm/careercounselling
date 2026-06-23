import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/next';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OneGrasp — Student Growth Platform',
  description:
    'Get a personalized student guidance report in minutes. Discover strengths, learning style, future pathways, and a simple action plan tailored to class 6-12 students.',
  openGraph: {
    title: 'OneGrasp — Student Growth Platform',
    description: 'Your personalized school-to-future roadmap, created with care and expert guidance.',
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
        <Analytics />
      </body>
    </html>
  );
}
