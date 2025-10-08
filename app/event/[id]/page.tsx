'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase, Event, Profile, SocialPlatform } from '@/lib/supabase';
import { LettuceVisualization } from '@/components/lettuce/LettuceVisualization';
import { AttendeeOrbit } from '@/components/attendees/AttendeeOrbit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Leaf, ArrowLeft, Copy, Users, ExternalLink, QrCode, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeToEventAttendees, updatePresence, markOffline } from '@/lib/realtime';
import { QRCodeSVG } from 'qrcode.react';

export default function EventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Profile[]>([]);
  const [selectedAttendee, setSelectedAttendee] = useState<Profile | null>(null);
  const [attendeeSocials, setAttendeeSocials] = useState<SocialPlatform[]>([]);
  const [userSocials, setUserSocials] = useState<SocialPlatform[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const publicEventUrl = typeof window !== 'undefined' && event
    ? `${window.location.origin}/e/${event.party_code}`
    : '';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user && eventId) {
      loadEvent();
      loadAttendees();
      loadUserSocials();
      updatePresence(eventId, user.id);

      const channel = subscribeToEventAttendees(eventId, () => {
        loadAttendees();
      });

      const interval = setInterval(() => {
        updatePresence(eventId, user.id);
      }, 30000);

      return () => {
        markOffline(eventId, user.id);
        channel.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [user, loading, eventId]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event');
    }
  };

  const loadAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          user_id,
          profiles (*)
        `)
        .eq('event_id', eventId);

      if (error) throw error;

      const profilesList = data
        ?.map((a: any) => a.profiles)
        .filter((p: any) => p && p.id !== user?.id) || [];

      setAttendees(profilesList);
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  };

  const loadUserSocials = async () => {
    try {
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      setUserSocials(data || []);
    } catch (error) {
      console.error('Error loading socials:', error);
    }
  };

  const handleAttendeeClick = async (attendee: Profile) => {
    setSelectedAttendee(attendee);

    try {
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .eq('user_id', attendee.id)
        .eq('is_visible', true);

      if (error) throw error;
      setAttendeeSocials(data || []);
    } catch (error) {
      console.error('Error loading attendee socials:', error);
      toast.error('Failed to load socials');
    }
  };

  const handleConnect = async (social: SocialPlatform) => {
    if (!selectedAttendee) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          event_id: eventId,
          from_user_id: user!.id,
          to_user_id: selectedAttendee.id,
          platform: social.platform,
        });

      if (error) throw error;

      window.open(social.profile_url, '_blank');
      toast.success(`Connected with ${selectedAttendee.display_name} on ${social.platform}!`);
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };

  const copyPartyCode = () => {
    if (event) {
      navigator.clipboard.writeText(event.party_code);
      toast.success('Party code copied!');
    }
  };

  const copyEventUrl = () => {
    navigator.clipboard.writeText(publicEventUrl);
    toast.success('Event link copied!');
  };

  const shareEvent = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.name,
          text: `Join me at ${event.name} on LettuceConnect`,
          url: publicEventUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyEventUrl();
    }
  };

  const handleToggleSocial = async (socialId: string) => {
    const social = userSocials.find(s => s.id === socialId);
    if (!social) return;

    try {
      const { error } = await supabase
        .from('social_platforms')
        .update({ is_visible: !social.is_visible })
        .eq('id', socialId);

      if (error) throw error;

      setUserSocials(userSocials.map(s =>
        s.id === socialId ? { ...s, is_visible: !s.is_visible } : s
      ));

      toast.success(social.is_visible ? 'Social hidden' : 'Social visible');
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user || !event) {
    if (!user) {
      router.push('/');
    }
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
            Dashboard
          </Button>
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
            {event.description && (
              <p className="text-muted-foreground mb-4">{event.description}</p>
            )}
            <div className="flex gap-2 justify-center items-center mb-4">
              <code className="px-4 py-2 bg-primary/10 rounded-lg font-mono text-xl">
                {event.party_code}
              </code>
              <Button size="icon" variant="outline" onClick={copyPartyCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2 justify-center items-center mb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQrModalOpen(true)}
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={copyEventUrl}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={shareEvent}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              {attendees.length + 1} / {event.max_attendees} attendees
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Your Lettuce</CardTitle>
                <CardDescription>Toggle visibility of your socials</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                {userSocials.length > 0 ? (
                  <LettuceVisualization
                    socials={userSocials}
                    onToggleSocial={handleToggleSocial}
                    size="medium"
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🥬</div>
                    <p className="text-muted-foreground mb-4">No socials added yet</p>
                    <Button onClick={() => router.push('/profile')}>Add Socials</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendees</CardTitle>
                <CardDescription>Click to view profiles and connect</CardDescription>
              </CardHeader>
              <CardContent>
                {attendees.length > 0 ? (
                  <AttendeeOrbit attendees={attendees} onAttendeeClick={handleAttendeeClick} />
                ) : (
                  <div className="text-center py-20">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No other attendees yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Share the party code to invite others
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedAttendee} onOpenChange={() => setSelectedAttendee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAttendee?.display_name}</DialogTitle>
            <DialogDescription>{selectedAttendee?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {attendeeSocials.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">Available socials:</p>
                {attendeeSocials.map((social) => (
                  <Button
                    key={social.id}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleConnect(social)}
                  >
                    <span className="capitalize">{social.platform}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">@{social.username}</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </Button>
                ))}
              </>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No socials shared at this event
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code for others to join {event.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-6 rounded-lg">
              <QRCodeSVG
                value={publicEventUrl}
                size={256}
                level="H"
                includeMargin
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1">{event.name}</p>
              <code className="text-xs text-muted-foreground">
                {event.party_code}
              </code>
            </div>
            <div className="w-full space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={copyEventUrl}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Event Link
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={shareEvent}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
