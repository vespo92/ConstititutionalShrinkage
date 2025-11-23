import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Supply Chain Transparency | Constitutional Shrinkage',
  description: 'Visualize supply chains, calculate economic distance, track products, and manage locality-based taxation for sustainable commerce.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
