export default function DocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <nav className="sticky top-4 space-y-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Getting Started</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/docs/getting-started" className="text-primary-600 font-medium">
                    Introduction
                  </a>
                </li>
                <li>
                  <a href="/docs/authentication" className="text-gray-600 hover:text-gray-900">
                    Authentication
                  </a>
                </li>
                <li>
                  <a href="/docs/rate-limits" className="text-gray-600 hover:text-gray-900">
                    Rate Limits
                  </a>
                </li>
                <li>
                  <a href="/docs/errors" className="text-gray-600 hover:text-gray-900">
                    Error Handling
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Core Concepts</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/docs/pagination" className="text-gray-600 hover:text-gray-900">
                    Pagination
                  </a>
                </li>
                <li>
                  <a href="/docs/webhooks" className="text-gray-600 hover:text-gray-900">
                    Webhooks
                  </a>
                </li>
                <li>
                  <a href="/docs/versioning" className="text-gray-600 hover:text-gray-900">
                    API Versioning
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/docs/bills" className="text-gray-600 hover:text-gray-900">
                    Bills
                  </a>
                </li>
                <li>
                  <a href="/docs/votes" className="text-gray-600 hover:text-gray-900">
                    Votes
                  </a>
                </li>
                <li>
                  <a href="/docs/regions" className="text-gray-600 hover:text-gray-900">
                    Regions
                  </a>
                </li>
                <li>
                  <a href="/docs/metrics" className="text-gray-600 hover:text-gray-900">
                    Metrics
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3">
          <div className="prose max-w-none">
            <h1>Constitutional Platform API</h1>
            <p className="text-xl text-gray-600">
              Build civic technology applications with access to bills, voting data,
              regional metrics, and governance information.
            </p>

            <h2>Quick Start</h2>
            <p>
              Get started with the Constitutional API in minutes. First, get your API key
              from the <a href="/console/keys">developer console</a>.
            </p>

            <h3>1. Install an SDK</h3>
            <div className="grid md:grid-cols-2 gap-4 not-prose">
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">npm</p>
                <code>npm install @constitutional/sdk</code>
              </div>
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">pip</p>
                <code>pip install constitutional-sdk</code>
              </div>
            </div>

            <h3>2. Make Your First Request</h3>
            <pre className="not-prose">
              <code>{`import { Constitutional } from '@constitutional/sdk';

const client = new Constitutional({
  apiKey: 'your-api-key',
});

// List bills in voting
const bills = await client.bills.list({
  status: 'voting',
});

console.log(bills.data);`}</code>
            </pre>

            <h2>Base URL</h2>
            <p>All API requests should be made to:</p>
            <pre className="not-prose">
              <code>https://api.constitutional.io/api/v1</code>
            </pre>

            <h2>Authentication</h2>
            <p>
              Authenticate your requests using an API key. Include it in the
              <code>Authorization</code> header:
            </p>
            <pre className="not-prose">
              <code>Authorization: Bearer your-api-key</code>
            </pre>
            <p>
              Or use the <code>X-API-Key</code> header:
            </p>
            <pre className="not-prose">
              <code>X-API-Key: your-api-key</code>
            </pre>

            <h2>Response Format</h2>
            <p>All responses are JSON. Successful responses include a <code>data</code> field:</p>
            <pre className="not-prose">
              <code>{`{
  "data": {
    "id": "bill_abc123",
    "title": "Renewable Energy Act",
    "status": "voting"
  }
}`}</code>
            </pre>

            <p>List endpoints include pagination:</p>
            <pre className="not-prose">
              <code>{`{
  "data": [...],
  "pagination": {
    "cursor": "next_page_cursor",
    "hasMore": true,
    "total": 150
  }
}`}</code>
            </pre>

            <h2>Error Handling</h2>
            <p>Errors include a code and message:</p>
            <pre className="not-prose">
              <code>{`{
  "error": {
    "code": "NOT_FOUND",
    "message": "Bill bill_invalid not found"
  }
}`}</code>
            </pre>

            <h2>Next Steps</h2>
            <ul>
              <li>
                <a href="/docs/authentication">Learn more about authentication</a>
              </li>
              <li>
                <a href="/api-reference">Explore the API reference</a>
              </li>
              <li>
                <a href="/sdks">Download an SDK</a>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
