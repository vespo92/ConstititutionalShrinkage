'use client';

import { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import TBLSpider from '@/components/visualization/TBLSpider';
import SummaryCard from '@/components/results/SummaryCard';
import RecommendationPanel from '@/components/results/RecommendationPanel';

interface SandboxResult {
  billId: string;
  region: string;
  scenario: string;
  summary: {
    people: { score: number; confidence: number[] };
    planet: { score: number; confidence: number[]; carbonDelta: number };
    profit: { score: number; confidence: number[]; economicImpact: number };
  };
  overallScore: number;
  tradeOffs: Array<{ dimension1: string; dimension2: string; description: string }>;
  recommendations: Array<{
    type: 'warning' | 'suggestion' | 'opportunity';
    title: string;
    description: string;
    confidence: number;
    relatedFactors: string[];
  }>;
}

export default function SandboxPage() {
  const [billId, setBillId] = useState('BILL-001');
  const [region, setRegion] = useState('national');
  const [scenario, setScenario] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSimulation() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sandbox/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId, region, scenario })
      });

      if (!response.ok) {
        throw new Error('Failed to run simulation');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quick Sandbox</h1>
        <p className="mt-1 text-sm text-gray-500">
          Run a quick simulation with preset scenarios
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill ID
            </label>
            <input
              type="text"
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter bill ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="national">National</option>
              <option value="northeast">Northeast</option>
              <option value="midwest">Midwest</option>
              <option value="south">South</option>
              <option value="west">West</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scenario
            </label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as 'conservative' | 'moderate' | 'aggressive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={runSimulation}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Run Simulation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Overall Score</h2>
                <p className="text-sm text-gray-500">
                  {result.scenario.charAt(0).toUpperCase() + result.scenario.slice(1)} scenario
                </p>
              </div>
              <div className={`text-4xl font-bold ${
                result.overallScore > 20 ? 'text-green-600' :
                result.overallScore < -20 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {result.overallScore > 0 ? '+' : ''}{result.overallScore}
              </div>
            </div>
          </div>

          {/* TBL Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              dimension="people"
              score={result.summary.people.score}
              confidence={result.summary.people.confidence as [number, number]}
            />
            <SummaryCard
              dimension="planet"
              score={result.summary.planet.score}
              confidence={result.summary.planet.confidence as [number, number]}
              additionalMetric={{
                label: 'Carbon Impact',
                value: `${result.summary.planet.carbonDelta > 0 ? '+' : ''}${result.summary.planet.carbonDelta.toLocaleString()} tons`
              }}
            />
            <SummaryCard
              dimension="profit"
              score={result.summary.profit.score}
              confidence={result.summary.profit.confidence as [number, number]}
              additionalMetric={{
                label: 'Economic Impact',
                value: `$${(result.summary.profit.economicImpact / 1000000).toFixed(1)}M`
              }}
            />
          </div>

          {/* Spider Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <TBLSpider
              data={{
                people: result.summary.people.score,
                planet: result.summary.planet.score,
                profit: result.summary.profit.score
              }}
              title="Triple Bottom Line Profile"
            />
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <RecommendationPanel recommendations={result.recommendations} />
          )}
        </div>
      )}
    </div>
  );
}
