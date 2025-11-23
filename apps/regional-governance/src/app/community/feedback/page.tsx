'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FeedbackForm from '@/components/community/FeedbackForm';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function FeedbackPage() {
  const handleSubmitFeedback = async (feedback: Parameters<typeof FeedbackForm>[0] extends { onSubmit: (d: infer D) => void } ? D : never) => {
    console.log('Submitting feedback:', feedback);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <Link href="/community" className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} className="mr-1" />
        Back to Community
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit Feedback</h1>
        <p className="mt-1 text-gray-600">
          Share your thoughts, suggestions, or concerns with pod leadership
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardContent>
          <FeedbackForm podId="pod-ca-sf" onSubmit={handleSubmitFeedback} />
        </CardContent>
      </Card>

      {/* Info */}
      <Card variant="bordered">
        <CardContent>
          <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>Your feedback will be reviewed by pod leadership</li>
            <li>You'll receive updates on the status of your feedback</li>
            <li>Important issues may be addressed in community meetings</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
