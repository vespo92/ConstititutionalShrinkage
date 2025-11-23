export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Build on Constitutional
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-primary-100">
              Access governance data, voting results, and regional metrics through our
              powerful APIs and SDKs.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <a
                href="/docs/getting-started"
                className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition"
              >
                Get Started
              </a>
              <a
                href="/api-reference"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
              >
                API Reference
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Build
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Bills & Legislation"
            description="Access real-time bill data, version history, amendments, and voting status across all regions."
            icon="📜"
          />
          <FeatureCard
            title="Voting Data"
            description="Get voting session results, participation rates, demographic breakdowns, and historical trends."
            icon="🗳️"
          />
          <FeatureCard
            title="Regional Metrics"
            description="Track Triple Bottom Line scores, governance health, and compare performance across regions."
            icon="📊"
          />
          <FeatureCard
            title="Full-Text Search"
            description="Powerful search across bills, regions, and governance data with relevance scoring."
            icon="🔍"
          />
          <FeatureCard
            title="Webhooks"
            description="Get real-time notifications when bills pass, votes end, or metrics change."
            icon="🔔"
          />
          <FeatureCard
            title="SDKs"
            description="Official JavaScript/TypeScript and Python SDKs with full type support."
            icon="🛠️"
          />
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple, Powerful API
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary-300">
                JavaScript / TypeScript
              </h3>
              <pre className="bg-gray-800 p-6 rounded-lg overflow-x-auto">
                <code>{`import { Constitutional } from '@constitutional/sdk';

const client = new Constitutional({
  apiKey: process.env.CONSTITUTIONAL_API_KEY,
});

// List bills in voting
const bills = await client.bills.list({
  status: 'voting',
});

// Get voting results
const tally = await client.votes.getTally(
  'session_abc123'
);
console.log(\`Yes: \${tally.overall.yes}\`);`}</code>
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary-300">
                Python
              </h3>
              <pre className="bg-gray-800 p-6 rounded-lg overflow-x-auto">
                <code>{`from constitutional import Constitutional

client = Constitutional(
    api_key=os.environ["CONSTITUTIONAL_API_KEY"]
)

# List bills in voting
bills = client.bills.list(status="voting")

# Iterate through all results
for bill in client.bills.list_all(status="voting"):
    print(f"{bill.title}: {bill.status}")`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Flexible Rate Limits
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <PricingTier
            name="Free"
            requests="60/min"
            daily="1,000/day"
            webhooks="5"
            price="$0"
          />
          <PricingTier
            name="Developer"
            requests="300/min"
            daily="10,000/day"
            webhooks="20"
            price="$29/mo"
            highlighted
          />
          <PricingTier
            name="Organization"
            requests="1,000/min"
            daily="100,000/day"
            webhooks="100"
            price="$199/mo"
          />
          <PricingTier
            name="Government"
            requests="Unlimited"
            daily="Unlimited"
            webhooks="Unlimited"
            price="Contact Us"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Create your free API key and start building in minutes.
          </p>
          <a
            href="/console/keys"
            className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition"
          >
            Get Your API Key
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Documentation</h3>
              <ul className="space-y-2">
                <li><a href="/docs/getting-started">Getting Started</a></li>
                <li><a href="/docs/authentication">Authentication</a></li>
                <li><a href="/docs/rate-limits">Rate Limits</a></li>
                <li><a href="/docs/webhooks">Webhooks</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">API Reference</h3>
              <ul className="space-y-2">
                <li><a href="/api-reference#bills">Bills</a></li>
                <li><a href="/api-reference#votes">Votes</a></li>
                <li><a href="/api-reference#regions">Regions</a></li>
                <li><a href="/api-reference#metrics">Metrics</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">SDKs</h3>
              <ul className="space-y-2">
                <li><a href="/sdks#javascript">JavaScript</a></li>
                <li><a href="/sdks#python">Python</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="https://github.com/vespo92/ConstititutionalShrinkage">GitHub</a></li>
                <li><a href="/docs/support">Support</a></li>
                <li><a href="/docs/changelog">Changelog</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 Constitutional Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingTier({
  name,
  requests,
  daily,
  webhooks,
  price,
  highlighted,
}: {
  name: string;
  requests: string;
  daily: string;
  webhooks: string;
  price: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-xl ${
        highlighted
          ? 'bg-primary-600 text-white ring-4 ring-primary-300'
          : 'bg-white border border-gray-200'
      }`}
    >
      <h3 className="text-xl font-bold mb-4">{name}</h3>
      <p className={`text-3xl font-bold mb-6 ${highlighted ? '' : 'text-gray-900'}`}>
        {price}
      </p>
      <ul className={`space-y-3 ${highlighted ? 'text-primary-100' : 'text-gray-600'}`}>
        <li>{requests} requests</li>
        <li>{daily} daily</li>
        <li>{webhooks} webhooks</li>
      </ul>
    </div>
  );
}
