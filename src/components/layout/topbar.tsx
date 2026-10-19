'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, Building2, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { getCurrentUser } from '@/features/profile/queries';
import { getNotifications, ensurePatientThread } from '@/features/inbox/actions';

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<{ unreadThreads: any[]; lowReviews: any[]; totalCount: number }>({
    unreadThreads: [],
    lowReviews: [],
    totalCount: 0,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res) {
          setUserData(res);
          if (res.site?.id) {
            const notifs = await getNotifications(res.site.id);
            setNotifications(notifs);
          }
        }
      } catch (err) {}
    };

    fetchUser();

    window.addEventListener('profile-updated', fetchUser);
    return () => {
      window.removeEventListener('profile-updated', fetchUser);
    };
  }, [pathname]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const user = userData?.user || {};
  const site = userData?.site || {};
  const fullName = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Demo User';
  const email = user.email || 'demo@dagpatientconnect.com';
  const siteName = site.name || 'Bright Smiles Dental';
  const logoUrl = site.logo_url;
  const initials = `${user.first_name?.[0] || 'D'}${user.last_name?.[0] || 'U'}`;

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      {/* Practice / Clinic Identifier */}
      <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 shadow-xs">
        {logoUrl ? (
          <div className="h-5 w-5 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
            <img src={logoUrl} alt={siteName} className="h-full w-full object-cover" />
          </div>
        ) : (
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="font-semibold text-sm text-foreground">{siteName}</span>
      </div>

      {/* Search */}
      <div className="relative ml-auto flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients (Press Enter)..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications.totalCount > 0 && (
              <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {notifications.totalCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                {notifications.totalCount} new
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.totalCount === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-1">
              {notifications.unreadThreads.map((thread) => (
                <DropdownMenuItem
                  key={`thread-${thread.id}`}
                  className="flex flex-col items-start gap-1 p-2 cursor-pointer"
                  onClick={async () => {
                    await ensurePatientThread(thread.patient_id);
                    router.push(`/inbox?patient_id=${thread.patient_id}`);
                  }}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span>Unread message from {thread.patient_first} {thread.patient_last}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 pl-5">
                    {thread.last_message_preview || 'New message'}
                  </p>
                </DropdownMenuItem>
              ))}

              {notifications.lowReviews.map((rev) => (
                <DropdownMenuItem
                  key={`review-${rev.id}`}
                  className="flex flex-col items-start gap-1 p-2 cursor-pointer"
                  onClick={async () => {
                    await ensurePatientThread(rev.patient_id);
                    router.push(`/inbox?patient_id=${rev.patient_id}`);
                  }}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Low review ({rev.rating}★) from {rev.patient_first} {rev.patient_last}</span>
                  </div>
                  {rev.feedback && (
                    <p className="text-[11px] text-muted-foreground italic line-clamp-1 pl-5">
                      &quot;{rev.feedback}&quot;
                    </p>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-center justify-center text-xs text-primary font-medium cursor-pointer"
            onClick={() => router.push('/inbox')}
          >
            View all in Inbox
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center overflow-hidden text-xs">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span className="hidden font-medium md:inline">{fullName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{fullName}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/logout')} className="text-destructive focus:text-destructive">Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}


