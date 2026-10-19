'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, Building2 } from 'lucide-react';
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

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = () => {
      getCurrentUser().then((res) => {
        if (res) setUserData(res);
      }).catch(() => {});
    };

    fetchUser();

    window.addEventListener('profile-updated', fetchUser);
    return () => {
      window.removeEventListener('profile-updated', fetchUser);
    };
  }, [pathname]);

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
        <Input placeholder="Search patients, appointments..." className="pl-9" />
      </div>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-600" />
      </Button>

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


