'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell, User } from 'lucide-react';
import { useState } from 'react';
import RegionSelector from './RegionSelector';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Pods', href: '/pods' },
  { name: 'Legislation', href: '/legislation' },
  { name: 'Coordination', href: '/coordination' },
  { name: 'Community', href: '/community' },
  { name: 'Map', href: '/map' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-pod-green-700 to-pod-green-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl mr-2">🌍</span>
              <span className="text-white font-bold text-xl hidden sm:block">
                Regional Governance
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-pod-green-600 text-white'
                      : 'text-gray-200 hover:bg-pod-green-600/50 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <RegionSelector />

            <button className="text-gray-200 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-pod-brown-400 rounded-full flex items-center justify-center text-white">
                <User size={16} />
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-200 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-pod-green-800 pb-4">
          <div className="px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-pod-green-600 text-white'
                      : 'text-gray-200 hover:bg-pod-green-600/50 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
