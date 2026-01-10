import { cn } from '@/lib/utils';
import type { AlertSeverity } from '@/lib/types';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  LucideIcon,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type StatusConfig = {
  [key in AlertSeverity | 'info']: {
    Icon: LucideIcon;
    className: string;
    text: string;
  };
};

const statusConfig: StatusConfig = {
  Tốt: {
    Icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800/60',
    text: 'Tốt',
  },
  'Trung bình': {
    Icon: AlertTriangle,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800/60',
    text: 'Trung bình',
  },
  Nguy hiểm: {
    Icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/60',
    text: 'Nguy hiểm',
  },
  info: {
    Icon: Info,
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/60',
    text: 'Thông tin'
  }
};

type StatusBadgeProps = {
  status: AlertSeverity;
  children?: React.ReactNode;
  iconOnly?: boolean;
  className?: string;
};

export default function StatusBadge({
  status,
  children,
  iconOnly = false,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.info;

  return (
    <Badge
      className={cn(
        'flex items-center gap-1.5 capitalize',
        config.className,
        iconOnly ? 'px-1.5' : 'px-2.5',
        className
      )}
    >
      <config.Icon className="h-3.5 w-3.5" />
      {!iconOnly && <span>{children || config.text}</span>}
    </Badge>
  );
}
