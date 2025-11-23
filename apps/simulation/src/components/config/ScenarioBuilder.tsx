'use client';

import { useState } from 'react';
import ParameterSlider from './ParameterSlider';

interface ScenarioConfig {
  timeHorizon: number;
  economic: {
    regulatoryBurden: number;
    baselineGdp: number;
  };
  environmental: {
    supplyChainLocality: number;
    resourceConsumption: number;
    renewableEnergy: number;
  };
  social: {
    accessibilityChange: number;
    inequalityImpact: number;
  };
}

interface ScenarioBuilderProps {
  initialConfig?: Partial<ScenarioConfig>;
  onConfigChange: (config: ScenarioConfig) => void;
}

const defaultConfig: ScenarioConfig = {
  timeHorizon: 5,
  economic: {
    regulatoryBurden: 50,
    baselineGdp: 1000000000
  },
  environmental: {
    supplyChainLocality: 50,
    resourceConsumption: 50,
    renewableEnergy: 30
  },
  social: {
    accessibilityChange: 0,
    inequalityImpact: 0
  }
};

export default function ScenarioBuilder({
  initialConfig,
  onConfigChange
}: ScenarioBuilderProps) {
  const [config, setConfig] = useState<ScenarioConfig>({
    ...defaultConfig,
    ...initialConfig
  });

  const [activeTab, setActiveTab] = useState<'economic' | 'environmental' | 'social'>('economic');

  const updateConfig = (path: string, value: number) => {
    const parts = path.split('.');
    const newConfig = { ...config };

    if (parts.length === 1) {
      (newConfig as Record<string, unknown>)[parts[0]] = value;
    } else {
      const section = parts[0] as keyof ScenarioConfig;
      (newConfig[section] as Record<string, number>)[parts[1]] = value;
    }

    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const tabs = [
    { id: 'economic', label: 'Economic', color: 'blue' },
    { id: 'environmental', label: 'Environmental', color: 'green' },
    { id: 'social', label: 'Social', color: 'amber' }
  ] as const;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Configuration</h3>

      {/* Time Horizon */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <ParameterSlider
          label="Time Horizon"
          value={config.timeHorizon}
          min={1}
          max={20}
          unit=" years"
          description="How far into the future to project outcomes"
          onChange={(value) => updateConfig('timeHorizon', value)}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === tab.id
                ? `border-${tab.color}-600 text-${tab.color}-600`
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'economic' && (
          <>
            <ParameterSlider
              label="Regulatory Burden"
              value={config.economic.regulatoryBurden}
              min={0}
              max={100}
              description="Level of regulatory requirements (0 = minimal, 100 = heavy)"
              onChange={(value) => updateConfig('economic.regulatoryBurden', value)}
            />
            <ParameterSlider
              label="Baseline GDP"
              value={config.economic.baselineGdp / 1000000}
              min={100}
              max={10000}
              unit="M"
              description="Economic baseline in millions"
              onChange={(value) => updateConfig('economic.baselineGdp', value * 1000000)}
            />
          </>
        )}

        {activeTab === 'environmental' && (
          <>
            <ParameterSlider
              label="Supply Chain Locality"
              value={config.environmental.supplyChainLocality}
              min={0}
              max={100}
              unit="%"
              description="Percentage of local sourcing"
              onChange={(value) => updateConfig('environmental.supplyChainLocality', value)}
            />
            <ParameterSlider
              label="Resource Consumption"
              value={config.environmental.resourceConsumption}
              min={0}
              max={100}
              description="Resource usage intensity (0 = minimal, 100 = heavy)"
              onChange={(value) => updateConfig('environmental.resourceConsumption', value)}
            />
            <ParameterSlider
              label="Renewable Energy Target"
              value={config.environmental.renewableEnergy}
              min={0}
              max={100}
              unit="%"
              description="Target renewable energy percentage"
              onChange={(value) => updateConfig('environmental.renewableEnergy', value)}
            />
          </>
        )}

        {activeTab === 'social' && (
          <>
            <ParameterSlider
              label="Accessibility Change"
              value={config.social.accessibilityChange}
              min={-100}
              max={100}
              description="Change in access to services (-100 = decrease, +100 = increase)"
              onChange={(value) => updateConfig('social.accessibilityChange', value)}
            />
            <ParameterSlider
              label="Inequality Impact"
              value={config.social.inequalityImpact * 100}
              min={-10}
              max={10}
              unit="%"
              description="Expected change in inequality (negative = reduced inequality)"
              onChange={(value) => updateConfig('social.inequalityImpact', value / 100)}
            />
          </>
        )}
      </div>
    </div>
  );
}
