'use client';

import { useState } from 'react';
import type { Pod } from '@/types';
import { formatPopulation } from '@/lib/utils';
import { podTypeLabels, podStatusLabels } from '@/lib/mock-data';

interface PodCompareProps {
  pods: Pod[];
  className?: string;
}

export default function PodCompare({ pods, className = '' }: PodCompareProps) {
  if (pods.length < 2) {
    return (
      <div className={`text-center py-12 text-gray-500 ${className}`}>
        Select at least 2 pods to compare
      </div>
    );
  }

  const metrics = [
    { key: 'population', label: 'Population', format: (v: number) => formatPopulation(v) },
    { key: 'tblScore', label: 'TBL Score', format: (v: number) => v.toFixed(1) },
    { key: 'people', label: 'People Score', format: (v: number) => v.toString() },
    { key: 'planet', label: 'Planet Score', format: (v: number) => v.toString() },
    { key: 'profit', label: 'Profit Score', format: (v: number) => v.toString() },
    { key: 'citizenSatisfaction', label: 'Citizen Satisfaction', format: (v: number) => `${v}%` },
    { key: 'participationRate', label: 'Participation Rate', format: (v: number) => `${v}%` },
    { key: 'legislationPassed', label: 'Legislation Passed', format: (v: number) => v.toString() },
    { key: 'resourceEfficiency', label: 'Resource Efficiency', format: (v: number) => `${v}%` },
  ];

  const getValue = (pod: Pod, key: string): number => {
    switch (key) {
      case 'population':
        return pod.population;
      case 'tblScore':
        return pod.metrics.tblScore.overall;
      case 'people':
        return pod.metrics.tblScore.people;
      case 'planet':
        return pod.metrics.tblScore.planet;
      case 'profit':
        return pod.metrics.tblScore.profit;
      case 'citizenSatisfaction':
        return pod.metrics.citizenSatisfaction;
      case 'participationRate':
        return pod.metrics.participationRate;
      case 'legislationPassed':
        return pod.metrics.legislationPassed;
      case 'resourceEfficiency':
        return pod.metrics.resourceEfficiency;
      default:
        return 0;
    }
  };

  const getBestValue = (key: string): number => {
    return Math.max(...pods.map((pod) => getValue(pod, key)));
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-4 font-medium text-gray-500">Metric</th>
            {pods.map((pod) => (
              <th key={pod.id} className="text-center p-4">
                <div className="font-semibold text-gray-900">{pod.name}</div>
                <div className="text-sm text-gray-500">{pod.code}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr className="bg-white">
            <td className="p-4 font-medium text-gray-700">Type</td>
            {pods.map((pod) => (
              <td key={pod.id} className="p-4 text-center">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                  {podTypeLabels[pod.type]}
                </span>
              </td>
            ))}
          </tr>
          <tr className="bg-white">
            <td className="p-4 font-medium text-gray-700">Status</td>
            {pods.map((pod) => (
              <td key={pod.id} className="p-4 text-center">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  pod.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {podStatusLabels[pod.status]}
                </span>
              </td>
            ))}
          </tr>
          {metrics.map((metric) => {
            const bestValue = getBestValue(metric.key);
            return (
              <tr key={metric.key} className="bg-white hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">{metric.label}</td>
                {pods.map((pod) => {
                  const value = getValue(pod, metric.key);
                  const isBest = value === bestValue;
                  return (
                    <td key={pod.id} className="p-4 text-center">
                      <span className={`font-medium ${isBest ? 'text-pod-green-600' : 'text-gray-900'}`}>
                        {metric.format(value)}
                        {isBest && ' ★'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
