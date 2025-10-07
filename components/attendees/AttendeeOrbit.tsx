'use client';

import { motion } from 'framer-motion';
import { Profile } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

type AttendeeOrbitProps = {
  attendees: (Profile & { distance?: number })[];
  onAttendeeClick?: (attendee: Profile) => void;
};

export function AttendeeOrbit({ attendees, onAttendeeClick }: AttendeeOrbitProps) {
  const maxRadius = 200;
  const minRadius = 120;

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {attendees.map((attendee, index) => {
        const angle = (index / attendees.length) * 2 * Math.PI;
        const distance = attendee.distance || Math.random();
        const radius = minRadius + (maxRadius - minRadius) * distance;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const initials = attendee.display_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <motion.div
            key={attendee.id}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: x - 20,
              y: y - 20,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay: index * 0.05,
            }}
          >
            <motion.button
              onClick={() => onAttendeeClick?.(attendee)}
              className="relative group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.3,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              />

              <Avatar className="w-10 h-10 border-2 border-primary/40 relative z-10">
                <AvatarImage src={attendee.avatar_url} alt={attendee.display_name} />
                <AvatarFallback className="bg-card text-foreground">
                  {initials || <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>

              <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded border border-border">
                  {attendee.display_name}
                </div>
              </div>
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}
