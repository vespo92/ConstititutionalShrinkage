'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const categoryOptions = [
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Economy', label: 'Economy' },
  { value: 'Housing', label: 'Housing' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'Public Safety', label: 'Public Safety' },
];

const regionOptions = [
  { value: 'reg-1', label: 'Pacific Northwest' },
  { value: 'reg-2', label: 'Southwest' },
  { value: 'reg-3', label: 'Midwest' },
  { value: 'reg-4', label: 'Northeast' },
  { value: 'reg-5', label: 'Southeast' },
];

export default function CreatePolicyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milestones, setMilestones] = useState([{ title: '', targetDate: '' }]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', targetDate: '' }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    router.push('/policies');
  };

  return (
    <div className="space-y-6">
      <Navigation
        breadcrumbs={[
          { name: 'Policies', href: '/policies' },
          { name: 'Create Policy' },
        ]}
        title="Create New Policy"
        description="Define a new policy for implementation in your region."
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Policy Title"
                  placeholder="Enter a descriptive title for this policy"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Provide a detailed description of the policy objectives and scope..."
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Category" options={categoryOptions} required />
                  <Select label="Region" options={regionOptions} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Target Completion Date" type="date" required />
                  <Input label="Estimated Budget" type="text" placeholder="$0.00" />
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Milestones</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Milestone
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={`Milestone ${index + 1}`}
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(e) => {
                          const newMilestones = [...milestones];
                          newMilestones[index].title = e.target.value;
                          setMilestones(newMilestones);
                        }}
                      />
                      <Input
                        label="Target Date"
                        type="date"
                        value={milestone.targetDate}
                        onChange={(e) => {
                          const newMilestones = [...milestones];
                          newMilestones[index].targetDate = e.target.value;
                          setMilestones(newMilestones);
                        }}
                      />
                    </div>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="mt-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                    <span className="text-sm text-gray-700">Requires approval</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                    <span className="text-sm text-gray-700">Track TBL impact</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600" defaultChecked />
                    <span className="text-sm text-gray-700">Enable notifications</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Legislation</CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="Link to legislation ID..." />
                <p className="text-xs text-gray-500 mt-2">Optional: Link this policy to existing legislation</p>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Create Policy
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
