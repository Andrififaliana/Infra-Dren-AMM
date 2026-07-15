import { cn } from '@/lib/utils';
import { CheckCircle, Wrench, AlertTriangle } from 'lucide-react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
}

const badgeVariants = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
};

const badgeIcons = {
  success: CheckCircle,
  warning: Wrench,
  danger: AlertTriangle,
  info: CheckCircle,
  default: CheckCircle,
};

export function Badge({ variant = 'default', children, className, icon = false }: BadgeProps) {
  const Icon = badgeIcons[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        badgeVariants[variant],
        className
      )}
    >
      {icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
