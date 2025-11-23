import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Policy Simulation | Constitutional Shrinkage',
  description: 'Simulate and model the impact of policy changes across People, Planet, and Profit dimensions',
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
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <a href="/" className="flex items-center">
                    <span className="text-xl font-bold text-primary-700">Policy Simulation</span>
                  </a>
                  <div className="hidden md:flex ml-10 space-x-8">
                    <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                      Dashboard
                    </a>
                    <a href="/new" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                      New Simulation
                    </a>
                    <a href="/compare" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                      Compare
                    </a>
                    <a href="/library" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                      Library
                    </a>
                    <a href="/sandbox" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                      Sandbox
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
