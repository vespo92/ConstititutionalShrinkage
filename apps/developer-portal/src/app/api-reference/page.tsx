export default function ApiReferencePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">API Reference</h1>

      <div className="space-y-12">
        {/* Bills */}
        <section id="bills">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Bills</h2>
          <div className="space-y-4">
            <Endpoint
              method="GET"
              path="/v1/bills"
              description="List bills with optional filtering"
              params={[
                { name: 'status', type: 'string', description: 'Filter by status' },
                { name: 'category', type: 'string', description: 'Filter by category' },
                { name: 'region', type: 'string', description: 'Filter by region' },
                { name: 'limit', type: 'number', description: 'Max results (default 20)' },
                { name: 'cursor', type: 'string', description: 'Pagination cursor' },
              ]}
            />
            <Endpoint
              method="GET"
              path="/v1/bills/:id"
              description="Get a specific bill by ID"
            />
            <Endpoint
              method="GET"
              path="/v1/bills/:id/versions"
              description="Get version history for a bill"
            />
            <Endpoint
              method="GET"
              path="/v1/bills/:id/diff"
              description="Get diff between bill versions"
              params={[
                { name: 'fromVersion', type: 'number', description: 'Starting version' },
                { name: 'toVersion', type: 'number', description: 'Ending version' },
              ]}
            />
            <Endpoint
              method="GET"
              path="/v1/bills/:id/amendments"
              description="Get amendments for a bill"
            />
          </div>
        </section>

        {/* Votes */}
        <section id="votes">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Votes</h2>
          <div className="space-y-4">
            <Endpoint
              method="GET"
              path="/v1/votes/sessions"
              description="List voting sessions"
              params={[
                { name: 'status', type: 'string', description: 'Filter by status' },
                { name: 'billId', type: 'string', description: 'Filter by bill' },
              ]}
            />
            <Endpoint
              method="GET"
              path="/v1/votes/sessions/:id"
              description="Get a specific voting session"
            />
            <Endpoint
              method="GET"
              path="/v1/votes/sessions/:id/tally"
              description="Get detailed tally with breakdowns"
            />
            <Endpoint
              method="GET"
              path="/v1/votes/statistics"
              description="Get overall voting statistics"
              params={[
                { name: 'period', type: 'string', description: 'Time period' },
              ]}
            />
          </div>
        </section>

        {/* Regions */}
        <section id="regions">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Regions</h2>
          <div className="space-y-4">
            <Endpoint
              method="GET"
              path="/v1/regions"
              description="List regions"
              params={[
                { name: 'type', type: 'string', description: 'Filter by type' },
                { name: 'parentId', type: 'string', description: 'Filter by parent' },
              ]}
            />
            <Endpoint
              method="GET"
              path="/v1/regions/:id"
              description="Get a specific region"
            />
            <Endpoint
              method="GET"
              path="/v1/regions/:id/metrics"
              description="Get detailed metrics for a region"
              params={[
                { name: 'period', type: 'string', description: 'Time period' },
              ]}
            />
            <Endpoint
              method="GET"
              path="/v1/regions/:id/leaderboard"
              description="Get leaderboard of child regions"
            />
          </div>
        </section>

        {/* Metrics */}
        <section id="metrics">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Metrics</h2>
          <div className="space-y-4">
            <Endpoint
              method="GET"
              path="/v1/metrics/overview"
              description="Get platform-wide metrics overview"
            />
            <Endpoint
              method="GET"
              path="/v1/metrics/tbl"
              description="Get Triple Bottom Line scores"
              params={[
                { name: 'regionId', type: 'string', description: 'Region ID' },
                { name: 'period', type: 'string', description: 'Time period' },
              ]}
            />
            <Endpoint
              method="GET"
              path="/v1/metrics/governance"
              description="Get governance health metrics"
            />
            <Endpoint
              method="GET"
              path="/v1/metrics/compare"
              description="Compare metrics across regions"
              params={[
                { name: 'regions', type: 'string', description: 'Comma-separated region IDs' },
                { name: 'metrics', type: 'string', description: 'Comma-separated metrics' },
              ]}
            />
          </div>
        </section>

        {/* Search */}
        <section id="search">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Search</h2>
          <div className="space-y-4">
            <Endpoint
              method="GET"
              path="/v1/search/bills"
              description="Search bills with full-text search"
              params={[
                { name: 'query', type: 'string', description: 'Search query (required)' },
                { name: 'status', type: 'string', description: 'Filter by status' },
                { name: 'category', type: 'string', description: 'Filter by category' },
              ]}
            />
            <Endpoint
              method="GET"
              path="/v1/search/regions"
              description="Search regions"
              params={[
                { name: 'query', type: 'string', description: 'Search query (required)' },
                { name: 'type', type: 'string', description: 'Filter by type' },
              ]}
            />
            <Endpoint
              method="GET"
              path="/v1/search/suggestions"
              description="Get search suggestions/autocomplete"
              params={[
                { name: 'query', type: 'string', description: 'Partial query' },
                { name: 'type', type: 'string', description: 'Suggestion type' },
              ]}
            />
          </div>
        </section>

        {/* Webhooks */}
        <section id="webhooks">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Webhooks</h2>
          <div className="space-y-4">
            <Endpoint
              method="POST"
              path="/v1/webhooks"
              description="Create a new webhook subscription"
            />
            <Endpoint
              method="GET"
              path="/v1/webhooks"
              description="List webhooks for your API key"
            />
            <Endpoint
              method="GET"
              path="/v1/webhooks/:id"
              description="Get a specific webhook"
            />
            <Endpoint
              method="PUT"
              path="/v1/webhooks/:id"
              description="Update a webhook"
            />
            <Endpoint
              method="DELETE"
              path="/v1/webhooks/:id"
              description="Delete a webhook"
            />
            <Endpoint
              method="GET"
              path="/v1/webhooks/:id/deliveries"
              description="Get delivery history"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
  params,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: { name: string; type: string; description: string }[];
}) {
  const methodColors = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <span
          className={`px-2 py-1 text-xs font-bold rounded ${methodColors[method]}`}
        >
          {method}
        </span>
        <code className="text-sm font-mono text-gray-800">{path}</code>
      </div>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      {params && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Parameters</p>
          <div className="space-y-1">
            {params.map((param) => (
              <div key={param.name} className="flex items-center text-sm">
                <code className="text-primary-600 font-mono">{param.name}</code>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-gray-500">{param.type}</span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-gray-600">{param.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
