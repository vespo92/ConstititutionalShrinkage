'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/styles/globals.css';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Mock user for development
const mockUser = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@constitutional-shrinkage.gov',
  role: 'administrator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    // Handle logout - will be implemented with auth provider
  };

  return (
    <html lang="en">
      <head>
        <title>Executive Dashboard | Constitutional Shrinkage</title>
        <meta name="description" content="Executive Dashboard for Regional Pod Administration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header user={mockUser} onLogout={handleLogout} />

            <div className="flex flex-1">
              {/* Sidebar */}
              <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />

              {/* Main Content */}
              <main
                className={cn(
                  'flex-1 transition-all duration-300',
                  sidebarCollapsed ? 'ml-16' : 'ml-64'
                )}
              >
                <div className="p-6 min-h-[calc(100vh-4rem)]">
                  {children}
                </div>
                <Footer />
              </main>
            </div>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
