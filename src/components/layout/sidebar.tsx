'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn('w-full', isCollapsed && 'px-2')}
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
      </div>
    </div>
  );
}
