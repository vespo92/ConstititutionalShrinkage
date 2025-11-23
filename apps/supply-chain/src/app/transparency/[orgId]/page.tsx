'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Award, Users, Leaf, Eye, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExportButton } from '@/components/shared/ExportButton';
import { useTransparency } from '@/hooks/useTransparency';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import type { TransparencyReport } from '@/types';

interface OrgReportPageProps {
  params: { orgId: string };
}

export default function OrgReportPage({ params }: OrgReportPageProps) {
  const { fetchReport, currentReport, isLoading, getScoreLevel } = useTransparency();

  useEffect(() => {
    fetchReport(params.orgId);
  }, [params.orgId, fetchReport]);

  if (isLoading || !currentReport) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent" />
      </div>
    );
  }

  const scoreLevel = getScoreLevel(currentReport.score.overall);
  const scoreColors = {
    excellent: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    good: 'text-lime-600 bg-lime-100 dark:bg-lime-900/20',
    moderate: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
    poor: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
    none: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  };

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/transparency">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentReport.organizationName}
            </h1>
            <p className="text-slate-500">Transparency Report</p>
          </div>
        </div>
        <ExportButton onExport={handleExport} label="Export Report" />
      </div>

      {/* Overall Score */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={cn('w-24 h-24 rounded-full flex items-center justify-center', scoreColors[scoreLevel])}>
                <span className="text-4xl font-bold">{currentReport.score.overall}</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white capitalize">
                  {scoreLevel} Transparency
                </h2>
                <p className="text-slate-500 mt-1">
                  Last updated: {formatDate(currentReport.score.lastUpdated)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentReport.score.badges.map(badge => (
                <span
                  key={badge.id}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    badge.level === 'platinum' ? 'bg-slate-200 text-slate-800' :
                    badge.level === 'gold' ? 'bg-amber-100 text-amber-800' :
                    badge.level === 'silver' ? 'bg-slate-100 text-slate-600' :
                    'bg-orange-100 text-orange-800'
                  )}
                >
                  <Award className="h-4 w-4 inline mr-1" />
                  {badge.name}
                </span>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Score Components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <Shield className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {currentReport.score.components.supplyChain}
            </p>
            <p className="text-sm text-slate-500">Supply Chain</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {currentReport.score.components.employment}
            </p>
            <p className="text-sm text-slate-500">Employment</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Leaf className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {currentReport.score.components.environmental}
            </p>
            <p className="text-sm text-slate-500">Environmental</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Eye className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {currentReport.score.components.disclosure}
            </p>
            <p className="text-sm text-slate-500">Disclosure</p>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply Chain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-500" />
              Supply Chain Disclosure
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Disclosure Level</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                currentReport.supplyChainDisclosure.level === 'full' ? 'bg-green-100 text-green-700' :
                currentReport.supplyChainDisclosure.level === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              )}>
                {currentReport.supplyChainDisclosure.level}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Verified Suppliers</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {currentReport.supplyChainDisclosure.verifiedSuppliers} / {currentReport.supplyChainDisclosure.totalSuppliers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Average Distance</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatNumber(currentReport.supplyChainDisclosure.averageDistance)} km
              </span>
            </div>
            <div className="pt-2">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{
                    width: `${(currentReport.supplyChainDisclosure.verifiedSuppliers / currentReport.supplyChainDisclosure.totalSuppliers) * 100}%`
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {Math.round((currentReport.supplyChainDisclosure.verifiedSuppliers / currentReport.supplyChainDisclosure.totalSuppliers) * 100)}% supplier verification rate
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Employment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Employment Practices
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Average Wage</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ${formatNumber(currentReport.employmentPractices.avgWage)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Minimum Wage</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ${formatNumber(currentReport.employmentPractices.minWage)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Benefits Score</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {currentReport.employmentPractices.benefitsScore}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Safety Rating</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {currentReport.employmentPractices.safetyRating}%
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Environmental */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">CO2 Emissions</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatNumber(currentReport.environmentalImpact.co2Emissions)} tonnes/year
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Renewable Energy</span>
              <span className="font-medium text-green-600">
                {currentReport.environmentalImpact.renewableEnergy}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Waste Recycling</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {currentReport.environmentalImpact.wasteRecycling}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Water Usage</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatNumber(currentReport.environmentalImpact.waterUsage)} L/year
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {currentReport.certifications.map(cert => (
                <span
                  key={cert}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
                >
                  {cert}
                </span>
              ))}
            </div>
            {currentReport.certifications.length === 0 && (
              <p className="text-slate-500">No certifications recorded</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
