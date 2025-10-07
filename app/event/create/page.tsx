'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingLettuce } from '@/components/ui/loading-lettuce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Leaf, ArrowLeft, Calendar, Clock, Tag, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const SUGGESTED_INTERESTS = [
  'Photography',
  'Hiking',
  'Coding',
  'Gaming',
  'Music',
  'Travel',
  'Reading',
  'Fitness',
  'Art',
  'Cooking',
  'Design',
  'Entrepreneurship',
  'Investing',
  'Writing',
  'Yoga',
  'Coffee',
  'Movies',
  'Sports',
  'Tech',
  'Fashion',
];

export default function CreateEvent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState<'free' | 'basic' | 'pro' | 'enterprise'>('free');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  const generatePartyCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const tierLimits = {
    free: 100,
    basic: 200,
    pro: 1000,
    enterprise: 999999,
  };

  const handleAddInterest = (e?: React.FormEvent, customInterest?: string) => {
    e?.preventDefault();
    const interestToAdd = customInterest || newInterest;
    if (!interestToAdd.trim()) return;

    const normalizedInterest = interestToAdd.trim().toLowerCase();
    if (interests.includes(normalizedInterest)) {
      toast.error('Interest already added');
      return;
    }

    setInterests([...interests, normalizedInterest]);
    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!startDate || !startTime) {
      toast.error('Please set a start date and time');
      return;
    }

    setCreating(true);

    try {
      const partyCode = generatePartyCode();

      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateTime = endDate && endTime
        ? new Date(`${endDate}T${endTime}`).toISOString()
        : null;

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          created_by: user.id,
          name,
          description: description || null,
          party_code: partyCode,
          start_time: startDateTime,
          end_time: endDateTime,
          max_attendees: tierLimits[tier],
          tier,
          interests,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      const { error: attendeeError } = await supabase
        .from('event_attendees')
        .insert({
          event_id: event.id,
          user_id: user.id,
        });

      if (attendeeError) throw attendeeError;

      toast.success(`Event created! Party code: ${partyCode}`);
      router.push(`/event/${event.id}`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setCreating(false);
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

        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Create Event</h1>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Create a new event and get a party code to share with attendees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    placeholder="Tech Conference 2025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="A gathering of tech enthusiasts..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    <Tag className="w-4 h-4 inline mr-2" />
                    Event Interests (Optional)
                  </Label>
                  <form onSubmit={handleAddInterest} className="flex gap-2 mb-3">
                    <Input
                      placeholder="e.g., networking, tech, startups"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                    />
                    <Button type="submit" size="sm" disabled={!newInterest.trim()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </form>

                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_INTERESTS.filter(
                        (suggested) => !interests.includes(suggested.toLowerCase())
                      ).slice(0, 10).map((interest) => (
                        <Badge
                          key={interest}
                          variant="outline"
                          className="text-xs px-2 py-0.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleAddInterest(undefined, interest)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <Badge
                          key={interest}
                          variant="secondary"
                          className="text-sm px-3 py-1.5 flex items-center gap-2"
                        >
                          <Tag className="w-3 h-3" />
                          {interest}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(interest)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      End Date (Optional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">
                      <Clock className="w-4 h-4 inline mr-2" />
                      End Time (Optional)
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Event Tier</Label>
                  <RadioGroup value={tier} onValueChange={(v: any) => setTier(v)}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                        <RadioGroupItem value="free" id="free" />
                        <Label htmlFor="free" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">Free</div>
                              <div className="text-sm text-muted-foreground">
                                Up to 100 attendees
                              </div>
                            </div>
                            <div className="text-2xl font-bold">$0</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                        <RadioGroupItem value="basic" id="basic" />
                        <Label htmlFor="basic" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">Basic</div>
                              <div className="text-sm text-muted-foreground">
                                Up to 200 attendees
                              </div>
                            </div>
                            <div className="text-2xl font-bold">$49</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                        <RadioGroupItem value="pro" id="pro" />
                        <Label htmlFor="pro" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">Pro</div>
                              <div className="text-sm text-muted-foreground">
                                Up to 1,000 attendees
                              </div>
                            </div>
                            <div className="text-2xl font-bold">$199</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                        <RadioGroupItem value="enterprise" id="enterprise" />
                        <Label htmlFor="enterprise" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">Enterprise</div>
                              <div className="text-sm text-muted-foreground">
                                Unlimited attendees
                              </div>
                            </div>
                            <div className="text-2xl font-bold">$999</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Event'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
