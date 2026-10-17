'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Megaphone,
  Star,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getSidebarUnreadCount } from '@/features/inbox/actions';
import { ThemeToggle } from '@/components/shared/theme-toggle';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Patients', href: '/patients' },
  { icon: Calendar, label: 'Appointments', href: '/appointments' },
  { icon: MessageSquare, label: 'Inbox', href: '/inbox' },
  { icon: Megaphone, label: 'Campaigns', href: '/campaigns' },
  { icon: Star, label: 'Reviews', href: '/reviews' },
  { icon: FileText, label: 'Templates', href: '/templates' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const count = await getSidebarUnreadCount();
        setUnreadCount(count);
      } catch (e) {
        // ignore if unauthenticated or error
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <div
      className={cn(
        'relative flex h-full flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="font-semibold">D</span>
            </div>
            <span className="font-semibold">DAG Patient Connect</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="font-semibold">D</span>
          </Link>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isInbox = item.href === '/inbox';

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-between',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {isInbox && unreadCount > 0 && !isCollapsed && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px] rounded-full">
                      {unreadCount}
                    </Badge>
                  )}
                  {isInbox && unreadCount > 0 && isCollapsed && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn('flex-1', isCollapsed && 'px-2')}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
        {!isCollapsed && <ThemeToggle />}
      </div>
    </div>
  );
}

