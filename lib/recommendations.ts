import { supabase } from './supabase';

export interface RecommendedEvent {
  id: string;
  name: string;
  description: string | null;
  interests: string[];
  start_time: string;
  max_attendees: number;
  tier: string;
  party_code: string;
  match_score: number;
  matching_interests: string[];
  attendee_count: number;
}

export interface RecommendedPerson {
  id: string;
  display_name: string;
  avatar_url: string | null;
  interests: string[];
  match_score: number;
  matching_interests: string[];
  mutual_events: string[];
}

export async function getRecommendedEvents(
  userId: string,
  limit: number = 10
): Promise<RecommendedEvent[]> {
  try {
    const { data: userInterests, error: interestsError } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', userId);

    if (interestsError) throw interestsError;

    const interests = userInterests?.map((i) => i.interest) || [];

    if (interests.length === 0) {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (eventsError) throw eventsError;

      const eventsWithCounts = await Promise.all(
        (events || []).map(async (event) => {
          const { count } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return {
            ...event,
            match_score: 0,
            matching_interests: [],
            attendee_count: count || 0,
          };
        })
      );

      return eventsWithCounts;
    }

    const { data: userEventIds, error: userEventsError } = await supabase
      .from('event_attendees')
      .select('event_id')
      .eq('user_id', userId);

    if (userEventsError) throw userEventsError;

    const attendedEventIds = userEventIds?.map((e) => e.event_id) || [];

    const { data: allEvents, error: allEventsError } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true);

    if (allEventsError) throw allEventsError;

    const eventsWithScores = await Promise.all(
      (allEvents || [])
        .filter((event) => !attendedEventIds.includes(event.id))
        .map(async (event) => {
          const eventInterests = event.interests || [];
          const matchingInterests = eventInterests.filter((interest: string) =>
            interests.some(userInt => userInt.toLowerCase() === interest.toLowerCase())
          );
          const matchScore = matchingInterests.length / Math.max(interests.length, 1);

          const { count } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return {
            ...event,
            match_score: matchScore,
            matching_interests: matchingInterests,
            attendee_count: count || 0,
          };
        })
    );

    return eventsWithScores
      .sort((a, b) => b.match_score - a.match_score || b.attendee_count - a.attendee_count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recommended events:', error);
    return [];
  }
}

export async function getRecommendedPeople(
  userId: string,
  limit: number = 10
): Promise<RecommendedPerson[]> {
  try {
    const { data: userInterests, error: interestsError } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', userId);

    if (interestsError) throw interestsError;

    const interests = userInterests?.map((i) => i.interest) || [];

    const { data: userEvents, error: userEventsError } = await supabase
      .from('event_attendees')
      .select('event_id')
      .eq('user_id', userId);

    if (userEventsError) throw userEventsError;

    const userEventIds = userEvents?.map((e) => e.event_id) || [];

    const { data: allUsers, error: allUsersError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .neq('id', userId);

    if (allUsersError) throw allUsersError;

    const usersWithScores = await Promise.all(
      (allUsers || []).map(async (user) => {
        const { data: theirInterests } = await supabase
          .from('user_interests')
          .select('interest')
          .eq('user_id', user.id);

        const theirInterestsList = theirInterests?.map((i) => i.interest) || [];

        const matchingInterests = theirInterestsList.filter((interest: string) =>
          interests.some(userInt => userInt.toLowerCase() === interest.toLowerCase())
        );

        const { data: theirEvents } = await supabase
          .from('event_attendees')
          .select('event_id')
          .eq('user_id', user.id);

        const theirEventIds = theirEvents?.map((e) => e.event_id) || [];
        const mutualEvents = userEventIds.filter((id) => theirEventIds.includes(id));

        const interestScore = matchingInterests.length / Math.max(interests.length, 1);
        const eventScore = mutualEvents.length / Math.max(userEventIds.length, 1);
        const matchScore = (interestScore * 0.6 + eventScore * 0.4);

        return {
          id: user.id,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          interests: theirInterestsList,
          match_score: matchScore,
          matching_interests: matchingInterests,
          mutual_events: mutualEvents,
        };
      })
    );

    return usersWithScores
      .filter((user) => user.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recommended people:', error);
    return [];
  }
}
