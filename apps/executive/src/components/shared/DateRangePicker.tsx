'use client';

import { useState, useRef, useEffect } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  label?: string;
  placeholder?: string;
}

const presets = [
  { label: 'Last 7 days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'Last 90 days', getValue: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
  { label: 'This month', getValue: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  { label: 'Last month', getValue: () => ({
    start: startOfMonth(subMonths(new Date(), 1)),
    end: endOfMonth(subMonths(new Date(), 1))
  })},
  { label: 'This year', getValue: () => ({ start: startOfYear(new Date()), end: new Date() }) },
];

export function DateRangePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date range',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(value?.start ? format(value.start, 'yyyy-MM-dd') : '');
  const [endDate, setEndDate] = useState(value?.end ? format(value.end, 'yyyy-MM-dd') : '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    if (startDate && endDate) {
      onChange?.({
        start: new Date(startDate),
        end: new Date(endDate),
      });
      setIsOpen(false);
    }
  };

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    setStartDate(format(range.start, 'yyyy-MM-dd'));
    setEndDate(format(range.end, 'yyyy-MM-dd'));
    onChange?.(range);
    setIsOpen(false);
  };

  const displayValue = value
    ? `${format(value.start, 'MMM d, yyyy')} - ${format(value.end, 'MMM d, yyyy')}`
    : placeholder;

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg transition-colors',
          'bg-white border-gray-300 hover:border-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          isOpen && 'ring-2 ring-primary-500 border-transparent'
        )}
      >
        <span className={cn(!value && 'text-gray-400')}>{displayValue}</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            {/* Presets */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Quick Select
              </p>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Custom Range
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="button"
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
