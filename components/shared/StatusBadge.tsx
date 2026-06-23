'use client';

import { OrderStatus, STATUS_LABELS, STATUS_CLASSES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      STATUS_CLASSES[status],
      className
    )}>
      {STATUS_LABELS[status]}
    </span>
  );
}
