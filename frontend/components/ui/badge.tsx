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
  warning: 'bg-green-100 text-green-800 border-green-300',
  danger: 'bg-green-200 text-green-900 border-green-400',
  info: 'bg-green-50 text-green-600 border-green-200',
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
