'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Github } from 'lucide-react';
import Logo from '@/components/brand/Logo';

const LINKS = {
  Product: ['How it works', 'Features', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Legal: ['Privacy', 'Terms', 'Cookies', 'Security'],
  Support: ['Help center', 'Contact', 'Status', 'API docs'],
};

export default function Footer() {
  return (
    <footer className="bg-ink py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-ink-2">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Logo size={34} variant="light" />
            </Link>
            <p className="text-sm text-ink-3 leading-relaxed mb-5">
              Student guidance and practical study plans for classes 6–10.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-ink-2 flex items-center justify-center hover:bg-ink-3 transition-colors"
                >
                  <Icon className="w-4 h-4 text-ink-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-ink-3 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-4">
            &copy; {new Date().getFullYear()} OneGrasp, Inc. All rights reserved.
          </p>
          <p className="text-xs text-ink-4">
            Made with care for curious students and families.
          </p>
        </div>
      </div>
    </footer>
  );
}
