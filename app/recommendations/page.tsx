'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getRecommendedEvents, getRecommendedPeople, RecommendedEvent, RecommendedPerson } from '@/lib/recommendations';
import { LoadingLettuce } from '@/components/ui/loading-lettuce';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, ArrowLeft, Sparkles, Calendar, Users, Tag, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function RecommendationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEvent[]>([]);
  const [recommendedPeople, setRecommendedPeople] = useState<RecommendedPerson[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    setLoadingRecommendations(true);
    try {
      const [events, people] = await Promise.all([
        getRecommendedEvents(user.id, 12),
        getRecommendedPeople(user.id, 12),
      ]);

      setRecommendedEvents(events);
      setRecommendedPeople(people);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleJoinEvent = async (eventId: string, eventName: string) => {
    if (!user) return;

    setJoiningEventId(eventId);
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
    } finally {
      setJoiningEventId(null);
    }
  };

  const getMatchPercentage = (score: number): number => {
    return Math.round(score * 100);
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

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold">AI Recommendations</h1>
          </div>
          <p className="text-muted-foreground">
            Personalized suggestions based on your interests and activity
          </p>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="people">
              <Users className="w-4 h-4 mr-2" />
              People
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            {loadingRecommendations ? (
              <div className="flex justify-center py-12">
                <LoadingLettuce size="lg" />
              </div>
            ) : recommendedEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendedEvents.map((event) => {
                  const matchPercent = getMatchPercentage(event.match_score);
                  return (
                    <Card key={event.id} className="hover:border-primary transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          {matchPercent > 0 && (
                            <Badge variant="default" className="ml-2 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {matchPercent}%
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <CardDescription className="line-clamp-2">
                            {event.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(event.start_time).toLocaleDateString()}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              {event.attendee_count}/{event.max_attendees === 999999 ? '∞' : event.max_attendees}
                            </Badge>
                          </div>

                          {event.matching_interests.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1.5">Matching interests:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {event.matching_interests.map((interest) => (
                                  <Badge key={interest} variant="default" className="text-xs">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {event.interests && event.interests.length > 0 && event.matching_interests.length === 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1.5">Event interests:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {event.interests.slice(0, 3).map((interest) => (
                                  <Badge key={interest} variant="outline" className="text-xs">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => handleJoinEvent(event.id, event.name)}
                            disabled={joiningEventId === event.id}
                          >
                            {joiningEventId === event.id ? 'Joining...' : 'Join Event'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No event recommendations yet. Add more interests to your profile to get personalized suggestions!
                  </p>
                  <Button onClick={() => router.push('/profile')}>
                    Update Interests
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="people">
            {loadingRecommendations ? (
              <div className="flex justify-center py-12">
                <LoadingLettuce size="lg" />
              </div>
            ) : recommendedPeople.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendedPeople.map((person) => {
                  const matchPercent = getMatchPercentage(person.match_score);
                  return (
                    <Card key={person.id} className="hover:border-primary transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={person.avatar_url || undefined} />
                            <AvatarFallback>
                              {person.display_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{person.display_name}</h3>
                            <Badge variant="default" className="mt-1 flex items-center gap-1 w-fit">
                              <TrendingUp className="w-3 h-3" />
                              {matchPercent}% match
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {person.matching_interests.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1.5">Common interests:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {person.matching_interests.map((interest) => (
                                  <Badge key={interest} variant="default" className="text-xs">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {person.mutual_events.length > 0 && (
                            <div>
                              <Badge variant="secondary" className="text-xs">
                                {person.mutual_events.length} mutual event{person.mutual_events.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          )}

                          {person.interests.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1.5">Their interests:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {person.interests.slice(0, 5).map((interest) => (
                                  <Badge
                                    key={interest}
                                    variant={person.matching_interests.includes(interest) ? 'default' : 'outline'}
                                    className="text-xs"
                                  >
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No people recommendations yet. Join events and add interests to connect with like-minded people!
                  </p>
                  <Button onClick={() => router.push('/event/join')}>
                    Browse Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
