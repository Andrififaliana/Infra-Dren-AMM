'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LegendItem {
  label: string;
  color: string;
  type: 'marker' | 'line';
  dashed?: boolean;
}

interface MapLegendProps {
  items: LegendItem[];
  className?: string;
}

export function MapLegend({ items, className }: MapLegendProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 z-[1000] rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg',
        className,
      )}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        Légende
        {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {!collapsed && (
        <div className="px-3 pb-2 space-y-1.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-foreground/80">
              {item.type === 'marker' ? (
                <span
                  className="inline-block h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
              ) : (
                <span
                  className={cn(
                    'inline-block h-0.5 w-4 shrink-0 rounded',
                    item.dashed && 'border-t-2 border-dashed',
                  )}
                  style={{
                    backgroundColor: item.dashed ? 'transparent' : item.color,
                    borderColor: item.dashed ? item.color : undefined,
                    borderTopWidth: item.dashed ? 2 : 0,
                  }}
                />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
