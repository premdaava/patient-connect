'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { submitPublicBooking } from '@/features/booking/actions';

const SERVICES = [
  { id: '1', name: 'Dental Cleaning', duration: '45 mins', price: '$120' },
  { id: '2', name: 'Comprehensive Exam', duration: '30 mins', price: '$90' },
  { id: '3', name: 'Whitening Consultation', duration: '60 mins', price: '$150' },
  { id: '4', name: 'Emergency Checkup', duration: '30 mins', price: '$100' },
];

export function BookingClientView({ site, siteSlug }: { site: any; siteSlug: string }) {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';

  const [step, setStep] = useState(1);
  const [service, setService] = useState(SERVICES[0]);
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const slots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) {
      setError('Please fill required fields.');
      return;
    }
    if (!consent) {
      setError('Please agree to SMS communications.');
      return;
    }
    setError('');

    const dt = new Date(date);
    dt.setHours(10, 0, 0, 0);

    startTransition(async () => {
      const res = await submitPublicBooking(siteSlug, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        appointment_type: service.name,
        preferred_date: dt.toISOString(),
        notes,
        honeypot,
      });
      if (res.success) setStep(4);
      else setError(res.error || 'Failed.');
    });
  };

  return (
    <div className={'min-h-screen bg-slate-50 dark:bg-slate-950 p-4 ' + (isEmbed ? 'p-2 bg-transparent' : '')}>
      <div className='max-w-md mx-auto space-y-4'>
        {!isEmbed && (
          <div className='bg-card p-4 rounded-xl border text-center shadow-sm'>
            <h1 className='text-xl font-bold'>{site.name}</h1>
            <p className='text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1'>
              <MapPin className='h-3 w-3' /> {site.address || site.phone}
            </p>
          </div>
        )}

        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Select Service</CardTitle><CardDescription>Choose appointment type</CardDescription></CardHeader>
            <CardContent className='space-y-2'>
              {SERVICES.map(s => (
                <div key={s.id} onClick={() => setService(s)} className={'p-3 rounded-lg border cursor-pointer flex justify-between items-center ' + (service.id === s.id ? 'border-primary bg-primary/5' : '')}>
                  <div><div className='font-semibold text-sm'>{s.name}</div><div className='text-xs text-muted-foreground'>{s.duration} • {s.price}</div></div>
                  <div className={'w-4 h-4 rounded-full border flex items-center justify-center ' + (service.id === s.id ? 'bg-primary border-primary' : '')} />
                </div>
              ))}
            </CardContent>
            <CardFooter className='flex justify-end'><Button onClick={() => setStep(2)}>Continue <ChevronRight className='h-4 w-4 ml-1' /></Button></CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Date & Time</CardTitle><CardDescription>Select preferred schedule</CardDescription></CardHeader>
            <CardContent className='space-y-4'>
              <div><Label>Date</Label><Input type='date' value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} /></div>
              <div><Label>Time Slot</Label>
                <div className='grid grid-cols-2 gap-2 mt-1'>
                  {slots.map(t => <Button key={t} type='button' variant={time === t ? 'default' : 'outline'} size='sm' onClick={() => setTime(t)}>{t}</Button>)}
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-between'><Button variant='outline' onClick={() => setStep(1)}><ArrowLeft className='h-4 w-4 mr-1' /> Back</Button><Button onClick={() => setStep(3)}>Continue <ChevronRight className='h-4 w-4 ml-1' /></Button></CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>Your Details</CardTitle><CardDescription>Contact info for confirmation</CardDescription></CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className='space-y-3'>
                {error && <div className='text-xs text-red-500 bg-red-50 p-2 rounded'>{error}</div>}
                <div className='hidden'><input name='website' value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} /></div>
                <div className='grid grid-cols-2 gap-2'>
                  <div><Label>First Name *</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
                  <div><Label>Last Name *</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
                </div>
                <div><Label>Phone *</Label><Input type='tel' value={phone} onChange={e => setPhone(e.target.value)} required /></div>
                <div><Label>Email</Label><Input type='email' value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
                <div className='flex items-start space-x-2 pt-1'>
                  <Checkbox id='consent' checked={consent} onCheckedChange={c => setConsent(c === true)} />
                  <Label htmlFor='consent' className='text-xs text-muted-foreground leading-snug'>I agree to receive SMS communications regarding my appointments.</Label>
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'><Button type='button' variant='outline' onClick={() => setStep(2)}><ArrowLeft className='h-4 w-4 mr-1' /> Back</Button><Button type='submit' disabled={pending}>{pending ? 'Submitting...' : 'Book Appointment'}</Button></CardFooter>
            </form>
          </Card>
        )}

        {step === 4 && (
          <Card className='text-center p-6 space-y-4'>
            <div className='w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto'><CheckCircle2 className='h-6 w-6' /></div>
            <h2 className='text-lg font-bold'>Booking Request Submitted!</h2>
            <p className='text-xs text-muted-foreground'>We have sent a confirmation text to {phone}. Our staff will review and confirm your slot.</p>
            <Button onClick={() => setStep(1)} variant='outline' className='w-full'>Book Another</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
