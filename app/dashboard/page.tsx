'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase, SocialPlatform, Event } from '@/lib/supabase';
import { LettuceVisualization } from '@/components/lettuce/LettuceVisualization';
import { LoadingLettuce } from '@/components/ui/loading-lettuce';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Plus, LogOut, User as UserIcon, Calendar, Clock, Trash2, Tag } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [socials, setSocials] = useState<SocialPlatform[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadSocials();
      loadCreatedEvents();
    }
  }, [user]);

  const loadSocials = async () => {
    try {
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      setSocials(data || []);
    } catch (error) {
      console.error('Error loading socials:', error);
    }
  };

  const loadCreatedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user!.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setCreatedEvents(data || []);
    } catch (error) {
      console.error('Error loading created events:', error);
    }
  };

  const handleToggleSocial = async (socialId: string) => {
    const social = socials.find(s => s.id === socialId);
    if (!social) return;

    try {
      const { error } = await supabase
        .from('social_platforms')
        .update({ is_visible: !social.is_visible })
        .eq('id', socialId);

      if (error) throw error;

      setSocials(socials.map(s =>
        s.id === socialId ? { ...s, is_visible: !s.is_visible } : s
      ));

      toast.success(social.is_visible ? 'Social hidden' : 'Social visible');
    } catch (error) {
      toast.error('Failed to update social visibility');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleDeleteEvent = async (eventId: string, eventName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setCreatedEvents(createdEvents.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/profile')}>
              <UserIcon className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.display_name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
              {currentEvent
                ? `You're at ${currentEvent.name}`
                : 'Join or create an event to start connecting'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Your Lettuce</CardTitle>
                <CardDescription>
                  {socials.length > 0
                    ? 'Tap a leaf to toggle visibility'
                    : 'Add your social profiles to get started'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                {socials.length > 0 ? (
                  <LettuceVisualization
                    socials={socials}
                    onToggleSocial={handleToggleSocial}
                    size="medium"
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🥬</div>
                    <p className="text-muted-foreground mb-4">No socials added yet</p>
                    <Button onClick={() => router.push('/profile')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Socials
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with LettuceConnect</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/event/join')}
                >
                  Join Event
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/event/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/profile')}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Manage Socials
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push('/profile')}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Manage Interests
                </Button>
              </CardContent>
            </Card>
          </div>

          {createdEvents.length > 0 && (
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Your Events</CardTitle>
                <CardDescription>Events you've created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {createdEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                      onClick={() => router.push(`/event/${event.id}`)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(event.start_time), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.start_time), 'h:mm a')}
                          </span>
                          <code className="px-2 py-0.5 bg-primary/10 rounded text-xs font-mono">
                            {event.party_code}
                          </code>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteEvent(event.id, event.name, e)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="font-semibold">Add Your Socials</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect your LinkedIn, Instagram, X, and other profiles
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="font-semibold">Join an Event</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter a party code or create your own event
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="font-semibold">Start Networking</h4>
                  <p className="text-sm text-muted-foreground">
                    See attendees and tap to connect instantly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
