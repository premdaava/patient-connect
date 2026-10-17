'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Send, Sparkles, Bot, CheckCheck, Phone } from 'lucide-react';
import { sendMessage } from '@/features/inbox/actions';
import { toast } from 'sonner';
import { SimulateReplyDialog } from './simulate-reply-dialog';

interface Props {
  siteId: string;
  userId: string;
  thread: any;
  messages: any[];
  templates: any[];
  onMessageSent: () => void;
}

export function ChatPanel({ siteId, userId, thread, messages, templates, onMessageSent }: Props) {
  const [body, setBody] = useState('');
  const [simulateOpen, setSimulateOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20 text-muted-foreground p-6 text-center">
        <div>
          <p className="font-medium">Select a conversation</p>
          <p className="text-xs mt-1">Choose a thread from the left</p>
        </div>
      </div>
    );
  }

  const patient = thread.patient;
  const initials = `${patient.first_name[0] || ''}${patient.last_name[0] || ''}`.toUpperCase();

  const handleSend = async () => {
    if (!body.trim()) return;
    try {
      const res = await sendMessage(siteId, thread.id, patient.id, body, thread.channel, userId);
      if (!res.success) throw new Error(res.error || 'Failed');
      setBody('');
      onMessageSent();
      toast.success('Sent');
    } catch (e: any) {
      toast.error(e.message || 'Error');
    }
  };

  const applyTemplate = (t: any) => {
    let text = t.body.replace(/\{\{first_name\}\}/g, patient.first_name).replace(/\{\{site_name\}\}/g, 'Bright Smiles Dental').replace(/\{\{review_link\}\}/g, 'https://dagpatientconnect.com/r/xyz');
    setBody(text);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-primary/10 text-primary font-semibold">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">{patient.first_name} {patient.last_name}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {patient.phone}</span>
              <Badge variant="outline" className="text-[10px] py-0">{thread.channel.toUpperCase()}</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSimulateOpen(true)} className="gap-1.5 text-xs">
          <Bot className="h-3.5 w-3.5 text-primary" /> Simulate Reply
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
        {messages.map((m) => {
          const inbound = m.direction === 'inbound';
          return (
            <div key={m.id} className={`flex flex-col ${inbound ? 'items-start' : 'items-end'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${inbound ? 'bg-white dark:bg-slate-900 border rounded-tl-sm' : 'bg-primary text-primary-foreground rounded-tr-sm'}`}>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground px-1">
                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                {!inbound && <CheckCheck className="h-3 w-3 text-primary" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t bg-background space-y-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
              <Sparkles className="h-3 w-3 text-primary" /> Templates
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {templates.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => applyTemplate(t)}>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{t.body}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Message ${patient.first_name}...`}
            className="min-h-[40px] max-h-32 text-xs resize-none py-2.5"
            rows={1}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <Button onClick={handleSend} size="icon" className="h-10 w-10 shrink-0" disabled={!body.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      </div>

      <SimulateReplyDialog open={simulateOpen} onOpenChange={setSimulateOpen} threadId={thread.id} patientId={patient.id} patientName={`${patient.first_name} ${patient.last_name}`} onSimulated={onMessageSent} />
    </div>
  );
}
