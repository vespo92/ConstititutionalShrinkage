import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Legislative System | Constitutional Shrinkage',
  description: 'Git-style legislative system for decentralized governance',
};

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Bills', href: '/bills' },
  { name: 'Create Bill', href: '/bills/create' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gov-blue shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <span className="text-2xl mr-2">&#9878;</span>
                  <span className="text-white font-bold text-xl">
                    Legislative System
                  </span>
                </Link>
              </div>
              <nav className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">Citizen Portal</span>
                <div className="w-8 h-8 bg-gov-gold rounded-full flex items-center justify-center text-gov-blue font-bold">
                  C
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-400 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-3">Legislative System</h3>
                <p className="text-sm">
                  A decentralized, git-style approach to lawmaking with full
                  transparency and citizen participation.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Resources</h3>
                <ul className="text-sm space-y-2">
                  <li><Link href="/bills" className="hover:text-white">Browse Bills</Link></li>
                  <li><Link href="/bills/create" className="hover:text-white">Propose a Bill</Link></li>
                  <li><a href="#" className="hover:text-white">Constitution</a></li>
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Governance</h3>
                <ul className="text-sm space-y-2">
                  <li><a href="#" className="hover:text-white">Transparency Report</a></li>
                  <li><a href="#" className="hover:text-white">Metrics Dashboard</a></li>
                  <li><a href="#" className="hover:text-white">Regional Pods</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
              Constitutional Shrinkage Project - Governance of the People, by the People, for the People
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
