import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AnalyticsNav } from '@/components/layouts/AnalyticsNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Constitutional Shrinkage',
  description: 'Real-time governance analytics and business intelligence platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <AnalyticsNav />
          <main className="lg:pl-64">
            <div className="px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
