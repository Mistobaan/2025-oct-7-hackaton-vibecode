import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function subscribeToEventAttendees(
  eventId: string,
  onUpdate: () => void
): RealtimeChannel {
  const channel = supabase
    .channel(`event-${eventId}-attendees`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'event_attendees',
        filter: `event_id=eq.${eventId}`,
      },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToSocialVisibility(
  eventId: string,
  onUpdate: () => void
): RealtimeChannel {
  const channel = supabase
    .channel(`event-${eventId}-socials`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'event_social_visibility',
        filter: `event_id=eq.${eventId}`,
      },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return channel;
}

export async function updatePresence(eventId: string, userId: string) {
  await supabase
    .from('event_attendees')
    .update({
      is_online: true,
      last_seen: new Date().toISOString(),
    })
    .eq('event_id', eventId)
    .eq('user_id', userId);
}

export async function markOffline(eventId: string, userId: string) {
  await supabase
    .from('event_attendees')
    .update({
      is_online: false,
      last_seen: new Date().toISOString(),
    })
    .eq('event_id', eventId)
    .eq('user_id', userId);
}
