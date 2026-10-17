'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { inviteTeamMember, updateMemberRole, removeTeamMember } from '@/features/settings/actions';
import { toast } from 'sonner';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TeamTab({ siteId, members }: { siteId: string; members: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', role: 'staff' as 'owner' | 'admin' | 'staff', phone: '' });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await inviteTeamMember(siteId, form);
      if (res.success) {
        toast.success('Member invited.');
        setOpen(false);
        setForm({ email: '', first_name: '', last_name: '', role: 'staff', phone: '' });
        router.refresh();
      } else {
        toast.error('Failed.');
      }
    } catch {
      toast.error('Error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRole = async (membershipId: string, role: any) => {
    await updateMemberRole(siteId, membershipId, role);
    toast.success('Role updated.');
    router.refresh();
  };

  const handleRemove = async (membershipId: string) => {
    if (!confirm('Remove member?')) return;
    await removeTeamMember(siteId, membershipId);
    toast.success('Member removed.');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Team Members</CardTitle>
            <CardDescription>Manage staff accounts and roles.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><UserPlus className="h-4 w-4" /> Invite</Button></DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>Add staff to your practice.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>First Name</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required /></div>
                    <div><Label>Last Name</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required /></div>
                  </div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Role</Label>
                    <Select value={form.role} onValueChange={(v: any) => setForm({ ...form, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter><Button type="submit" disabled={loading}>{loading ? 'Inviting...' : 'Invite'}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((m) => (
              <div key={m.membershipId} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{m.firstName?.[0]}{m.lastName?.[0]}</div>
                  <div>
                    <h4 className="font-medium text-sm">{m.firstName} {m.lastName}</h4>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={m.role} onValueChange={(v: any) => handleRole(m.membershipId, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemove(m.membershipId)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
