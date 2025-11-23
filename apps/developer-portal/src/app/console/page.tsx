export default function ConsolePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Developer Console</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <a
          href="/console/keys"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition"
        >
          <div className="text-3xl mb-4">🔑</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">API Keys</h2>
          <p className="text-gray-600">
            Create and manage your API keys. Control access and permissions.
          </p>
        </a>

        <a
          href="/console/usage"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition"
        >
          <div className="text-3xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Usage</h2>
          <p className="text-gray-600">
            Monitor your API usage, track requests, and view rate limit status.
          </p>
        </a>

        <a
          href="/console/webhooks"
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition"
        >
          <div className="text-3xl mb-4">🔔</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Webhooks</h2>
          <p className="text-gray-600">
            Configure webhook endpoints and view delivery history.
          </p>
        </a>
      </div>

      {/* Quick Stats */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard title="API Calls Today" value="0" />
          <StatCard title="Rate Limit" value="60/min" />
          <StatCard title="Active Webhooks" value="0" />
          <StatCard title="Tier" value="Free" />
        </div>
      </section>

      {/* Getting Started */}
      <section className="mt-12 bg-primary-50 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Getting Started
        </h2>
        <div className="space-y-4">
          <Step
            number={1}
            title="Create an API Key"
            description="Go to API Keys and create your first key"
            completed={false}
          />
          <Step
            number={2}
            title="Make Your First Request"
            description="Use the API key to fetch some bills"
            completed={false}
          />
          <Step
            number={3}
            title="Set Up Webhooks"
            description="Get notified when bills pass or votes end"
            completed={false}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  completed,
}: {
  number: number;
  title: string;
  description: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          completed
            ? 'bg-green-500 text-white'
            : 'bg-white text-gray-600 border-2 border-gray-300'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
