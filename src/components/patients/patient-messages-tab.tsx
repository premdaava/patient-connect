'use client';

import { SendPatientMessageDialog } from './send-patient-message-dialog';

interface PatientMessagesTabProps {
  patientId: string;
  patientName: string;
  messages: any[];
}

export function PatientMessagesTab({ patientId, patientName, messages }: PatientMessagesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">Conversation History</h3>
          <p className="text-xs text-muted-foreground">All SMS and Email interactions with {patientName}</p>
        </div>
        <SendPatientMessageDialog patientId={patientId} patientName={patientName} />
      </div>

      {messages.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          No messages found in conversation history.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => {
            const isOutbound = msg.direction === 'outbound';
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-lg p-4 rounded-lg border ${
                  isOutbound ? 'ml-auto bg-primary/5 border-primary/20' : 'mr-auto bg-card'
                }`}
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <span className="font-semibold uppercase text-[10px] tracking-wider">
                    {msg.channel} &bull; {isOutbound ? 'Outbound (Staff)' : 'Inbound (Patient)'}
                  </span>
                  <span>{new Date(msg.created_at).toLocaleString()}</span>
                </div>
                {msg.subject && <p className="font-semibold text-sm mb-1">Subject: {msg.subject}</p>}
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
