export default function SDKsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Official SDKs</h1>
      <p className="text-xl text-gray-600 mb-12">
        Use our official SDKs for the best developer experience with full type support
        and automatic pagination.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* JavaScript SDK */}
        <section id="javascript" className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-2xl">
              JS
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                JavaScript / TypeScript
              </h2>
              <p className="text-gray-500">@constitutional/sdk</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Installation</h3>
              <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm">
                <code>npm install @constitutional/sdk</code>
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Quick Start</h3>
              <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`import { Constitutional } from '@constitutional/sdk';

const client = new Constitutional({
  apiKey: process.env.CONSTITUTIONAL_API_KEY,
});

// List bills
const bills = await client.bills.list({
  status: 'voting',
});

// Iterate through all bills
for await (const bill of client.bills.listAll()) {
  console.log(bill.title);
}`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Full TypeScript support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Async iterators for pagination
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Automatic retries
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Works in Node.js and browsers
                </li>
              </ul>
            </div>

            <a
              href="https://github.com/vespo92/ConstititutionalShrinkage/tree/main/packages/sdk-js"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View on GitHub →
            </a>
          </div>
        </section>

        {/* Python SDK */}
        <section id="python" className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl text-white">
              🐍
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Python</h2>
              <p className="text-gray-500">constitutional-sdk</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Installation</h3>
              <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm">
                <code>pip install constitutional-sdk</code>
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Quick Start</h3>
              <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`from constitutional import Constitutional

client = Constitutional(
    api_key=os.environ["CONSTITUTIONAL_API_KEY"]
)

# List bills
bills = client.bills.list(status="voting")

# Iterate through all bills
for bill in client.bills.list_all():
    print(bill.title)

# Works great with pandas!
import pandas as pd
df = pd.DataFrame([b.to_dict() for b in bills.data])`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Pydantic models with type hints
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Generator-based pagination
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Automatic retries with backoff
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Pandas DataFrame compatible
                </li>
              </ul>
            </div>

            <a
              href="https://github.com/vespo92/ConstititutionalShrinkage/tree/main/packages/sdk-python"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View on GitHub →
            </a>
          </div>
        </section>
      </div>

      {/* Common Features */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          What You Get With Our SDKs
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Type Safety</h3>
            <p className="text-gray-600">
              Full type definitions for all API responses. Catch errors at compile
              time, not runtime.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Automatic Pagination</h3>
            <p className="text-gray-600">
              Iterate through all results without worrying about cursors. We handle
              the pagination for you.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Error Handling</h3>
            <p className="text-gray-600">
              Typed error classes for rate limits, authentication, and not found
              errors. Handle each case appropriately.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Retry Logic</h3>
            <p className="text-gray-600">
              Built-in retry logic with exponential backoff for transient errors
              and rate limits.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Webhook Verification</h3>
            <p className="text-gray-600">
              Helper methods to verify webhook signatures and ensure payloads are
              authentic.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Zero Dependencies</h3>
            <p className="text-gray-600">
              Minimal dependencies to keep your bundle small. Just the essentials
              for making API calls.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
