'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  Building2,
  Globe2,
  Plane,
  FileText,
  Library,
  Rocket,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { signOut } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/brand/Logo';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/career-analysis', icon: Search, label: 'Career Analysis' },
  { href: '/dashboard/india-colleges', icon: Building2, label: 'India Colleges' },
  { href: '/dashboard/abroad-colleges', icon: Globe2, label: 'Abroad Colleges' },
  { href: '/dashboard/abroad-applications', icon: Plane, label: 'Abroad Applications' },
  { href: '/dashboard/exams', icon: FileText, label: 'Exams' },
  { href: '/dashboard/career-library', icon: Library, label: 'Career Library' },
  { href: '/dashboard/career-boosters', icon: Rocket, label: 'Career Boosters' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    signOut();
    router.push('/');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-line">
        <Link href="/" className="flex items-center">
          <Logo size={30} />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-red-soft text-red shadow-sm'
                  : 'text-ink-3 hover:bg-line-2 hover:text-ink'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-red' : ''}`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-red" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-5 border-t border-line">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-3 hover:bg-red-soft hover:text-red transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-line bg-surface shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/30 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-surface border-r border-line z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-line bg-surface shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-ink-2 hover:bg-line-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo size={26} />
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
