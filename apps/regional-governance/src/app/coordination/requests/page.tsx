'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { mockPods } from '@/lib/mock-data';
import RequestForm from '@/components/coordination/RequestForm';
import Card, { CardContent } from '@/components/ui/Card';

export default function NewCoordinationRequestPage() {
  const handleSubmit = async (data: Parameters<typeof RequestForm>[0] extends { onSubmit: (d: infer D) => void } ? D : never) => {
    // Simulate submission
    console.log('Submitting coordination request:', data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Redirect would happen here
  };

  const availablePods = mockPods.map(p => ({ id: p.id, name: p.name, code: p.code }));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <Link href="/coordination" className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} className="mr-1" />
        Back to Coordination
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Coordination Request</h1>
        <p className="mt-1 text-gray-600">
          Submit a new inter-pod coordination request
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardContent>
          <RequestForm onSubmit={handleSubmit} availablePods={availablePods} />
        </CardContent>
      </Card>
    </div>
  );
}
