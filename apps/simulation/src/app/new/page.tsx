'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import ScenarioBuilder from '@/components/config/ScenarioBuilder';
import ParameterSlider from '@/components/config/ParameterSlider';

export default function NewSimulationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    billId: '',
    region: 'national',
    timeHorizon: 5,
    confidenceLevel: 0.95,
    economic: {
      baselineGdp: 1000000000,
      regulatoryBurden: 50
    },
    environmental: {
      baselineCarbon: 50000,
      supplyChainLocality: 50,
      resourceConsumption: 50,
      energyMix: {
        coal: 20,
        naturalGas: 30,
        nuclear: 15,
        solar: 15,
        wind: 10,
        hydro: 8,
        other: 2
      }
    },
    social: {
      populationAffected: 100000,
      accessibilityChange: 0,
      inequalityImpact: 0
    }
  });

  const updateFormData = (path: string, value: unknown) => {
    const parts = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: Record<string, unknown> = newData;

      for (let i = 0; i < parts.length - 1; i++) {
        current = { ...current[parts[i]] as Record<string, unknown> };
        let parent: Record<string, unknown> = newData;
        for (let j = 0; j < i; j++) {
          parent = parent[parts[j]] as Record<string, unknown>;
        }
        parent[parts[i]] = current;
      }

      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  async function handleSubmit() {
    if (!formData.billId) {
      setError('Bill ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          economic: {
            ...formData.economic,
            taxRateChanges: [],
            spendingChanges: []
          }
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create simulation');
      }

      const data = await response.json();
      router.push(`/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Simulation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure and create a new policy simulation
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              s === step ? 'bg-primary-600 text-white' :
              s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-16 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill ID *
            </label>
            <input
              type="text"
              value={formData.billId}
              onChange={(e) => updateFormData('billId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter bill ID (e.g., BILL-2024-001)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={formData.region}
              onChange={(e) => updateFormData('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="national">National</option>
              <option value="northeast">Northeast</option>
              <option value="midwest">Midwest</option>
              <option value="south">South</option>
              <option value="west">West</option>
            </select>
          </div>

          <ParameterSlider
            label="Time Horizon"
            value={formData.timeHorizon}
            min={1}
            max={20}
            unit=" years"
            description="How far into the future to project outcomes"
            onChange={(value) => updateFormData('timeHorizon', value)}
          />

          <ParameterSlider
            label="Confidence Level"
            value={formData.confidenceLevel * 100}
            min={80}
            max={99}
            step={1}
            unit="%"
            description="Statistical confidence for projections"
            onChange={(value) => updateFormData('confidenceLevel', value / 100)}
          />
        </div>
      )}

      {/* Step 2: Economic & Environmental */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Economic & Environmental Parameters</h2>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-md font-medium text-gray-700 mb-4">Economic</h3>
            <div className="space-y-4">
              <ParameterSlider
                label="Baseline GDP"
                value={formData.economic.baselineGdp / 1000000}
                min={100}
                max={10000}
                unit="M"
                description="Economic baseline in millions"
                onChange={(value) => updateFormData('economic.baselineGdp', value * 1000000)}
              />
              <ParameterSlider
                label="Regulatory Burden"
                value={formData.economic.regulatoryBurden}
                min={0}
                max={100}
                description="Level of regulatory requirements"
                onChange={(value) => updateFormData('economic.regulatoryBurden', value)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 mb-4">Environmental</h3>
            <div className="space-y-4">
              <ParameterSlider
                label="Baseline Carbon"
                value={formData.environmental.baselineCarbon}
                min={0}
                max={200000}
                unit=" tons"
                description="Current carbon emissions"
                onChange={(value) => updateFormData('environmental.baselineCarbon', value)}
              />
              <ParameterSlider
                label="Supply Chain Locality"
                value={formData.environmental.supplyChainLocality}
                min={0}
                max={100}
                unit="%"
                description="Percentage of local sourcing"
                onChange={(value) => updateFormData('environmental.supplyChainLocality', value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Social & Review */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Social Parameters & Review</h2>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-md font-medium text-gray-700 mb-4">Social</h3>
            <div className="space-y-4">
              <ParameterSlider
                label="Population Affected"
                value={formData.social.populationAffected}
                min={0}
                max={1000000}
                description="Number of people directly affected"
                onChange={(value) => updateFormData('social.populationAffected', value)}
              />
              <ParameterSlider
                label="Accessibility Change"
                value={formData.social.accessibilityChange}
                min={-100}
                max={100}
                description="Change in access to services"
                onChange={(value) => updateFormData('social.accessibilityChange', value)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 mb-4">Configuration Summary</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Bill ID</dt>
                <dd className="font-medium text-gray-900">{formData.billId || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Region</dt>
                <dd className="font-medium text-gray-900">{formData.region}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Time Horizon</dt>
                <dd className="font-medium text-gray-900">{formData.timeHorizon} years</dd>
              </div>
              <div>
                <dt className="text-gray-500">Confidence Level</dt>
                <dd className="font-medium text-gray-900">{(formData.confidenceLevel * 100).toFixed(0)}%</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(s => Math.min(3, s + 1))}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Creating...' : 'Create Simulation'}
          </button>
        )}
      </div>
    </div>
  );
}
