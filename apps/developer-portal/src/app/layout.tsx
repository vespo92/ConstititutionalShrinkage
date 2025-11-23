import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Constitutional Platform - Developer Portal',
  description: 'Build on the Constitutional governance platform with our APIs and SDKs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <a href="/" className="flex items-center">
                  <span className="text-xl font-bold text-primary-600">
                    Constitutional
                  </span>
                  <span className="ml-2 text-gray-500">Developers</span>
                </a>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  <a
                    href="/docs"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary-500"
                  >
                    Documentation
                  </a>
                  <a
                    href="/api-reference"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-primary-500"
                  >
                    API Reference
                  </a>
                  <a
                    href="/sdks"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-primary-500"
                  >
                    SDKs
                  </a>
                  <a
                    href="/console"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-primary-500"
                  >
                    Console
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <a
                  href="/console/keys"
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Get API Key
                </a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
