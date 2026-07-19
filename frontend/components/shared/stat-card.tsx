import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  index?: number;
}

export function StatCard({ title, value, icon, description, trend, className, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn('rounded-xl border border-slate-200 bg-white p-6 shadow-sm', className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
          {trend && (
            <p className={cn('text-xs font-medium', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <motion.div
            className="text-green-500"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
          >
            {typeof icon === 'string' ? <span className="text-2xl">{icon}</span> : icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
