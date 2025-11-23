'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  debounceMs?: number;
}

export default function SearchBar({
  placeholder = 'Search...',
  onSearch,
  className = '',
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const id = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);

      setTimeoutId(id);
    },
    [onSearch, debounceMs, timeoutId]
  );

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pod-green-500 focus:border-pod-green-500"
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
