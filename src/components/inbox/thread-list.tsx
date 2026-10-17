'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter } from 'lucide-react';

interface Props {
  threads: any[];
  selectedThreadId?: string;
  onSelectThread: (thread: any) => void;
}

export function ThreadList({ threads, selectedThreadId, onSelectThread }: Props) {
  const [search, setSearch] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);

  const filtered = threads.filter((t) => {
    const isUnread = parseInt(t.unread_count || '0', 10) > 0;
    if (filterUnread && !isUnread) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.patient.first_name.toLowerCase().includes(q) ||
      t.patient.last_name.toLowerCase().includes(q) ||
      (t.last_message_preview && t.last_message_preview.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b space-y-3">
        <h2 className="font-semibold text-base">Inbox</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={!filterUnread ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs h-7 flex-1"
            onClick={() => setFilterUnread(false)}
          >
            All
          </Button>
          <Button
            variant={filterUnread ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs h-7 flex-1 gap-1"
            onClick={() => setFilterUnread(true)}
          >
            <Filter className="h-3 w-3" /> Unread
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No conversations found
          </div>
        ) : (
          filtered.map((t) => {
            const isSelected = selectedThreadId === t.id;
            const unread = parseInt(t.unread_count || '0', 10) > 0;
            const patient = t.patient;
            const initials = `${patient.first_name[0] || ''}${patient.last_name[0] || ''}`.toUpperCase();

            return (
              <div
                key={t.id}
                onClick={() => onSelectThread(t)}
                className={`p-3.5 cursor-pointer transition-colors flex gap-3 items-start relative hover:bg-muted/50 ${
                  isSelected ? 'bg-muted/80' : unread ? 'bg-primary/5' : ''
                }`}
              >
                {unread && (
                  <span className="absolute left-1.5 top-5 h-2 w-2 rounded-full bg-primary" />
                )}
                <Avatar className="h-9 w-9 bg-primary/10 text-primary font-semibold text-xs shrink-0">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-xs font-medium truncate ${unread ? 'font-bold' : ''}`}>
                      {patient.first_name} {patient.last_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(t.last_message_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {t.last_message_preview || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
