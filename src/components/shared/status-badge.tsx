import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

const statusConfig: Record<StatusType, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  success: { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100/80' },
  warning: { variant: 'default', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80' },
  error: { variant: 'destructive', className: '' },
  info: { variant: 'default', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80' },
  default: { variant: 'secondary', className: '' },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {label}
    </Badge>
  );
}
