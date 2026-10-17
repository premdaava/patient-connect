'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Template } from '@/db/schema';
import { FileText, Plus, Trash2, Edit } from 'lucide-react';
import { TemplateEditorDialog } from './template-editor-dialog';
import { deleteTemplate, toggleTemplateActive } from '@/features/templates/actions';
import { toast } from 'sonner';

interface Props {
  initialTemplates: Template[];
  siteId: string;
  siteName: string;
}

const CATEGORIES = [
  { key: 'appointment_reminder', label: 'Appointment Reminders' },
  { key: 'follow_up', label: 'Follow Ups' },
  { key: 'promotional', label: 'Promotional' },
  { key: 'general', label: 'General' },
];

export function TemplatesView({ initialTemplates, siteId, siteName }: Props) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);

  const handleNew = () => { setSelected(null); setEditorOpen(true); };
  const handleEdit = (t: Template) => { setSelected(t); setEditorOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await deleteTemplate(siteId, id);
      setTemplates((p) => p.filter((t) => t.id !== id));
      toast.success('Deleted');
    } catch (e: any) {
      toast.error(e.message || 'Error');
    }
  };

  const handleToggle = async (id: string, current: string) => {
    const next = current !== 'true';
    try {
      await toggleTemplateActive(siteId, id, next);
      setTemplates((p) => p.map((t) => (t.id === id ? { ...t, is_active: next ? 'true' : 'false' } : t)));
      toast.success(next ? 'Activated' : 'Deactivated');
    } catch (e: any) {
      toast.error(e.message || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Templates"
        description="Reusable message templates with merge fields"
        actions={<Button onClick={handleNew}><Plus className="mr-2 h-4 w-4" />New Template</Button>}
      />

      {templates.length === 0 ? (
        <EmptyState icon={FileText} title="No templates" description="Create message templates" action={{ label: 'New Template', onClick: handleNew }} />
      ) : (
        <div className="space-y-8">
          {CATEGORIES.map((cat) => {
            const list = templates.filter((t) => t.category === cat.key);
            if (list.length === 0) return null;
            return (
              <div key={cat.key} className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight">{cat.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((t) => (
                    <Card key={t.id} className="flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-base font-semibold">{t.name}</CardTitle>
                          <Badge variant={t.channel === 'sms' ? 'default' : 'secondary'}>{t.channel.toUpperCase()}</Badge>
                        </div>
                        {t.subject && <p className="text-xs text-muted-foreground mt-1">Subject: {t.subject}</p>}
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm text-muted-foreground line-clamp-3 bg-muted/50 p-2.5 rounded-md font-mono text-xs">{t.body}</p>
                      </CardContent>
                      <CardFooter className="pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Switch checked={t.is_active === 'true'} onCheckedChange={() => handleToggle(t.id, t.is_active)} />
                          <span>{t.is_active === 'true' ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TemplateEditorDialog open={editorOpen} onOpenChange={setEditorOpen} siteId={siteId} siteName={siteName} template={selected} />
    </div>
  );
}
