import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Navigation } from '@/components/common/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Community | Constitutional Shrinkage',
  description: 'Engage in civic discourse - discussions, petitions, town halls, and community organizing',
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
            <Navigation />
            <main className="flex-1 p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
