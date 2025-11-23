'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  { label: 'Last 7 days', getDates: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 days', getDates: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'Last 90 days', getDates: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
  { label: 'This month', getDates: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  { label: 'Last month', getDates: () => ({
    start: startOfMonth(subMonths(new Date(), 1)),
    end: endOfMonth(subMonths(new Date(), 1))
  }) },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">
          {format(value.start, 'MMM d, yyyy')} - {format(value.end, 'MMM d, yyyy')}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(preset.getDates());
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
