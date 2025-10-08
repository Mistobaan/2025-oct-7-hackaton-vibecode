'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinEvent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [partyCode, setPartyCode] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setJoining(true);

    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('party_code', partyCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (eventError) throw eventError;
      if (!event) {
        toast.error('Event not found. Check the party code and try again.');
        setJoining(false);
        return;
      }

      const { data: attendeeCount } = await supabase
        .from('event_attendees')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id);

      const count = (attendeeCount as any)?.count || 0;

      if (count >= event.max_attendees) {
        toast.error('This event is at full capacity.');
        setJoining(false);
        return;
      }

      const { data: existing } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.success('You are already in this event!');
        router.push(`/event/${event.id}`);
        return;
      }

      const { error: attendeeError } = await supabase
        .from('event_attendees')
        .insert({
          event_id: event.id,
          user_id: user.id,
        });

      if (attendeeError) throw attendeeError;

      toast.success(`Joined ${event.name}!`);
      router.push(`/event/${event.id}`);
    } catch (error: any) {
      console.error('Error joining event:', error);
      toast.error(error.message || 'Failed to join event');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">LettuceConnect</span>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </nav>

        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Join Event</h1>

          <Card>
            <CardHeader>
              <CardTitle>Enter Party Code</CardTitle>
              <CardDescription>
                Ask the event organizer for the 6-character party code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="partyCode">Party Code</Label>
                  <Input
                    id="partyCode"
                    placeholder="ABC123"
                    value={partyCode}
                    onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                    required
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={joining}>
                  {joining ? 'Joining...' : 'Join Event'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Don't have a code?
                </p>
                <Button variant="link" onClick={() => router.push('/event/create')}>
                  Create your own event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
