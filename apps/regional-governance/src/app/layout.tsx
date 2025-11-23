import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Regional Governance | Constitutional Shrinkage',
  description: 'Decentralized regional pod management system with local autonomy',
};

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Pods', href: '/pods' },
  { name: 'Legislation', href: '/legislation' },
  { name: 'Coordination', href: '/coordination' },
  { name: 'Community', href: '/community' },
  { name: 'Map', href: '/map' },
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
        <header className="bg-gradient-to-r from-pod-green-700 to-pod-green-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <span className="text-2xl mr-2">🌍</span>
                  <span className="text-white font-bold text-xl">
                    Regional Governance
                  </span>
                </Link>
              </div>
              <nav className="hidden md:flex space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-200 hover:bg-pod-green-600/50 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm hidden sm:inline">CA-SF</span>
                <div className="w-8 h-8 bg-pod-brown-400 rounded-full flex items-center justify-center text-white font-bold">
                  A
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
                <h3 className="text-white font-semibold mb-3">Regional Governance</h3>
                <p className="text-sm">
                  Empowering communities through decentralized governance and local autonomy within constitutional bounds.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Quick Links</h3>
                <ul className="text-sm space-y-2">
                  <li><Link href="/pods" className="hover:text-white">Browse Pods</Link></li>
                  <li><Link href="/legislation" className="hover:text-white">Local Legislation</Link></li>
                  <li><Link href="/coordination" className="hover:text-white">Coordination</Link></li>
                  <li><Link href="/community" className="hover:text-white">Community</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Resources</h3>
                <ul className="text-sm space-y-2">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">API Documentation</a></li>
                  <li><a href="#" className="hover:text-white">Constitutional Framework</a></li>
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
