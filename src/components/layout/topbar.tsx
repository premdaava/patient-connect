'use client';

import { Search, Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/shared/avatar';
import { Input } from '@/components/ui/input';

export function TopBar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      {/* Site Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <span className="font-medium">Bright Smiles Dental</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Switch Site</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="flex flex-col">
              <span className="font-medium">Bright Smiles Dental</span>
              <span className="text-xs text-muted-foreground">Main demo site</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex flex-col">
              <span className="font-medium">Lakeside Family Clinic</span>
              <span className="text-xs text-muted-foreground">Demo site 2</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex flex-col">
              <span className="font-medium">Peak Physio</span>
              <span className="text-xs text-muted-foreground">Demo site 3</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
            <Avatar fallback="DU" className="h-8 w-8" />
            <span className="hidden font-medium md:inline">Demo User</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>Demo User</span>
              <span className="text-xs font-normal text-muted-foreground">
                demo@dagpatientconnect.com
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
