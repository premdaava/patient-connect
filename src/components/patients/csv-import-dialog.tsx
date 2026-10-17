'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Upload, Download, CheckCircle2 } from 'lucide-react';
import { importCsvPatients } from '@/features/patients/import';
import { toast } from 'sonner';

export function CsvImportDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [rows, setRows] = useState<Array<any>>([]);
  const [summary, setSummary] = useState<{ importedCount: number; skippedCount: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const downloadSample = () => {
    const blob = new Blob([`first_name,last_name,email,phone\nJohn,Doe,john@example.com,555-123-4567`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample_patients.csv'; a.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) return toast.error('CSV needs header and data');
      const headers = lines[0].split(',').map(h => h.trim());
      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
        parsed.push(obj);
      }
      setRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const res = await importCsvPatients(rows);
      if (res.success) {
        setSummary({ importedCount: res.importedCount, skippedCount: res.skippedCount });
        setStep('result');
        toast.success(`Imported ${res.importedCount} patients`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Patients CSV</DialogTitle>
          <DialogDescription>Batch import with E.164 normalization & deduplication.</DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border">
              <div><p className="font-medium text-sm">Sample Template</p><p className="text-xs text-muted-foreground">Download sample CSV format.</p></div>
              <Button variant="outline" size="sm" onClick={downloadSample}><Download className="mr-2 h-4 w-4" /> Sample CSV</Button>
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <Input type="file" accept=".csv" onChange={handleFile} className="max-w-xs mx-auto" />
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-3 py-2">
            <p className="font-medium text-sm">Previewing {rows.length} rows</p>
            <div className="border rounded-md max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr><th className="p-2 text-left">#</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Phone</th></tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{i + 1}</td><td className="p-2 font-medium">{r.first_name} {r.last_name}</td><td className="p-2">{r.email}</td><td className="p-2">{r.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={handleImport} disabled={loading}>{loading ? 'Importing...' : `Import ${rows.length}`}</Button>
            </DialogFooter>
          </div>
        )}

        {step === 'result' && summary && (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <h3 className="text-base font-semibold">Import Complete</h3>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left bg-muted/50 p-3 rounded-lg text-xs">
              <div><p className="text-muted-foreground">Imported</p><p className="text-xl font-bold text-green-600">{summary.importedCount}</p></div>
              <div><p className="text-muted-foreground">Skipped</p><p className="text-xl font-bold text-amber-600">{summary.skippedCount}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => { setStep('upload'); setRows([]); setSummary(null); setOpen(false); }} className="w-full">Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
