'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ThreadList } from './thread-list';
import { ChatPanel } from './chat-panel';
import { PatientSidebar } from './patient-sidebar';
import { getThreadMessages, markThreadRead, getThreadsAction } from '@/features/inbox/actions';



interface Props {
  initialThreads: any[];
  templates: any[];
  siteId: string;
  siteName: string;
  userId: string;
}

export function InboxView({ initialThreads, templates, siteId, siteName, userId }: Props) {
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get('patient_id');

  const [threads, setThreads] = useState<any[]>(initialThreads);
  const [selectedThread, setSelectedThread] = useState<any>(() => {
    if (patientIdParam) {
      const found = initialThreads.find(t => t.patient_id === patientIdParam || t.patient?.id === patientIdParam);
      if (found) return found;
    }
    return initialThreads[0] || null;
  });
  const [messages, setMessages] = useState<any[]>([]);

  const loadMessages = useCallback(async (threadId: string) => {
    const msgs = await getThreadMessages(siteId, threadId);
    setMessages(msgs);
  }, [siteId]);

  const refreshThreads = useCallback(async () => {
    const fresh = await getThreadsAction(siteId);
    setThreads(fresh);
    if (selectedThread) {
      const updated = fresh.find((t) => t.id === selectedThread.id);
      if (updated) setSelectedThread(updated);
    }
  }, [siteId, selectedThread]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
      if (parseInt(selectedThread.unread_count || '0', 10) > 0) {
        markThreadRead(siteId, selectedThread.id).then(() => {
          refreshThreads();
        });
      }
    }
  }, [selectedThread, siteId, loadMessages, refreshThreads]);

  const handleSelectThread = async (t: any) => {
    setSelectedThread(t);
    await loadMessages(t.id);
    if (parseInt(t.unread_count || '0', 10) > 0) {
      await markThreadRead(siteId, t.id);
      refreshThreads();
    }
  };

  const handleMessageSent = async () => {
    if (selectedThread) {
      await loadMessages(selectedThread.id);
      await refreshThreads();
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] border rounded-xl overflow-hidden bg-background shadow-sm">
      <ThreadList
        threads={threads}
        selectedThreadId={selectedThread?.id}
        onSelectThread={handleSelectThread}
      />
      <ChatPanel
        siteId={siteId}
        userId={userId}
        thread={selectedThread}
        messages={messages}
        templates={templates}
        onMessageSent={handleMessageSent}
      />
      {selectedThread && (
        <PatientSidebar
          siteId={siteId}
          patient={selectedThread.patient}
          consent={selectedThread.consent}
        />
      )}
    </div>
  );
}
