'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingLettuce } from '@/components/ui/loading-lettuce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, ArrowLeft, Tag, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  name: string;
  description: string | null;
  interests: string[];
  party_code: string;
  start_time: string;
  max_attendees: number;
  created_by: string;
  tier: string;
}

export default function JoinEvent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [partyCode, setPartyCode] = useState('');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadUserInterests();
      loadAvailableEvents();
    }
  }, [user]);

  const loadUserInterests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserInterests(data?.map((i) => i.interest) || []);
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  };

  const loadAvailableEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const toggleInterestFilter = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const filteredEvents = availableEvents.filter((event) => {
    if (selectedInterests.length === 0) return true;
    return event.interests?.some((interest) =>
      selectedInterests.includes(interest.toLowerCase())
    );
  });

  const matchingInterests = (eventInterests: string[]) => {
    if (!eventInterests) return [];
    return eventInterests.filter((interest) =>
      userInterests.includes(interest.toLowerCase())
    );
  };

  const handleJoinEvent = async (eventId: string, eventName: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.success('You are already in this event!');
        router.push(`/event/${eventId}`);
        return;
      }

      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success(`Joined ${eventName}!`);
      router.push(`/event/${eventId}`);
    } catch (error: any) {
      console.error('Error joining event:', error);
      toast.error(error.message || 'Failed to join event');
    }
  };

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
        <LoadingLettuce size="lg" />
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

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Join Event</h1>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Or Create Your Own</CardTitle>
                <CardDescription>
                  Start your own event and invite others
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <Button size="lg" onClick={() => router.push('/event/create')}>
                  Create Event
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Browse Events by Interest</CardTitle>
                  <CardDescription>
                    Find events that match your interests
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {userInterests.length > 0 && (
                <div className="mb-6">
                  <Label className="mb-2 block">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Filter by your interests:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {userInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleInterestFilter(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {loadingEvents ? (
                <div className="flex justify-center py-12">
                  <LoadingLettuce size="md" />
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map((event) => {
                    const matches = matchingInterests(event.interests || []);
                    return (
                      <Card key={event.id} className="hover:border-primary transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleJoinEvent(event.id, event.name)}
                            >
                              Join
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(event.start_time).toLocaleDateString()}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              {event.max_attendees === 999999 ? 'Unlimited' : `Up to ${event.max_attendees}`}
                            </Badge>
                          </div>

                          {event.interests && event.interests.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {event.interests.map((interest) => (
                                <Badge
                                  key={interest}
                                  variant={matches.includes(interest) ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {interest}
                                  {matches.includes(interest) && ' ✓'}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {selectedInterests.length > 0
                      ? 'No events found matching your selected interests.'
                      : 'No active events available right now.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
