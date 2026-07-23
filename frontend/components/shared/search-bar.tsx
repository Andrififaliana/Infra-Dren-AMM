'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Suggestions d'autocomplétion (filtrées par le parent) */
  suggestions?: string[];
  /** Délai de debounce en ms (défaut: 300) */
  debounceMs?: number;
  /** Appelé avec la valeur debounced */
  onDebouncedChange?: (value: string) => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher...',
  className,
  suggestions,
  debounceMs = 300,
  onDebouncedChange,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounce
  useEffect(() => {
    if (debounceMs <= 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onDebouncedChange?.(value);
    }, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, debounceMs, onDebouncedChange]);

  const showSuggestions =
    focused && suggestions && suggestions.length > 0 && value.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, (suggestions?.length ?? 1) - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && suggestions) {
      e.preventDefault();
      onChange(suggestions[selectedIndex]);
      setFocused(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Escape') {
      setFocused(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setSelectedIndex(-1);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-10 pr-10"
        icon={<Search className="h-4 w-4" />}
        rightIcon={
          value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-0.5 rounded hover:bg-muted transition-colors"
              tabIndex={-1}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )
        }
      />

      {/* Dropdown d'autocomplétion */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover p-1 shadow-lg">
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => {
                onChange(s);
                setFocused(false);
              }}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                i === selectedIndex
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{s}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
