import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navigation } from '@/components/layout/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Judicial System | Constitutional Shrinkage',
  description: 'Constitutional review, compliance checking, and case management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-6 lg:p-8 pb-20 md:pb-24 lg:pb-8">
              {children}
            </main>
          </div>
          <Navigation />
        </div>
      </body>
    </html>
  );
}
