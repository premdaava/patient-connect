'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <MobileNav />
          <span className="font-semibold">DAG Patient Connect</span>
        </div>
        <div className="hidden md:block">
          <TopBar />
        </div>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
