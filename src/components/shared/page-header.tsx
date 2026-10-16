import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ icon: Icon, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
