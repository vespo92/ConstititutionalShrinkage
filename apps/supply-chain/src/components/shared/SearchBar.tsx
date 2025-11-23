'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn, debounce } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onChange?: (query: string) => void;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  onChange,
  debounceMs = 300,
  className,
  showClearButton = true,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedOnChange = useCallback(
    debounce((value: string) => {
      onChange?.(value);
    }, debounceMs),
    [onChange, debounceMs]
  );

  const handleChange = (value: string) => {
    setQuery(value);
    debouncedOnChange(value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={e => handleChange(e.target.value)}
        className={cn(
          'w-full pl-10 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-600',
          'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          'focus:border-primary-500 focus:ring-primary-500 focus:outline-none focus:ring-2'
        )}
      />
      {showClearButton && query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
