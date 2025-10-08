'use client';

import { motion } from 'framer-motion';
import { Linkedin, Instagram, Github, Youtube, User } from 'lucide-react';
import { SocialPlatform } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type LettuceVisualizationProps = {
  socials: SocialPlatform[];
  onToggleSocial?: (socialId: string) => void;
  size?: 'small' | 'medium' | 'large';
  profileImage?: string | null;
  displayName?: string;
  showAsLeaves?: boolean;
};

const platformIcons = {
  linkedin: Linkedin,
  instagram: Instagram,
  x: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  github: Github,
  youtube: Youtube,
};

const sizeMap = {
  small: {
    container: 'w-40 h-40',
    center: 'w-16 h-16',
    leafWidth: 80,
    leafHeight: 100,
    iconSize: 'w-5 h-5',
  },
  medium: {
    container: 'w-64 h-64',
    center: 'w-24 h-24',
    leafWidth: 100,
    leafHeight: 130,
    iconSize: 'w-6 h-6',
  },
  large: {
    container: 'w-80 h-80',
    center: 'w-32 h-32',
    leafWidth: 120,
    leafHeight: 160,
    iconSize: 'w-7 h-7',
  },
};

export function LettuceVisualization({
  socials,
  onToggleSocial,
  size = 'large',
  profileImage,
  displayName,
  showAsLeaves = false,
}: LettuceVisualizationProps) {
  const sizes = sizeMap[size];
  const radius = size === 'small' ? 45 : size === 'medium' ? 70 : 90;

  const centerContent = showAsLeaves ? (
    <Avatar className="w-full h-full border-4 border-primary/40 shadow-lg">
      <AvatarImage src={profileImage || undefined} alt={displayName} />
      <AvatarFallback className="bg-primary/20 text-primary text-2xl">
        {displayName?.charAt(0).toUpperCase() || <User className="w-8 h-8" />}
      </AvatarFallback>
    </Avatar>
  ) : (
    <div className="text-primary text-4xl">🥬</div>
  );

  return (
    <div className={`relative ${sizes.container} mx-auto`}>
      <motion.div
        className={`absolute inset-0 bg-primary/10 rounded-full blur-2xl`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${sizes.center} ${
          showAsLeaves ? 'z-20' : 'bg-primary/20'
        } rounded-full flex items-center justify-center ${
          showAsLeaves ? '' : 'border-2 border-primary/40'
        }`}
        animate={
          showAsLeaves
            ? {}
            : {
                rotate: 360,
              }
        }
        transition={
          showAsLeaves
            ? {}
            : {
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }
        }
      >
        {centerContent}
      </motion.div>

      {socials.map((social, index) => {
        const startAngle = socials.length === 2 ? Math.PI * 0.65 : -Math.PI / 2;
        const angle = (index / socials.length) * 2 * Math.PI + startAngle;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const Icon = platformIcons[social.platform as keyof typeof platformIcons];

        const isBehindProfile = y > 0;

        if (showAsLeaves) {
          const leafRotation = (angle * 180) / Math.PI;

          return (
            <motion.div
              key={social.id}
              className="absolute top-1/2 left-1/2 cursor-pointer"
              style={{
                transformOrigin: 'center bottom',
                zIndex: isBehindProfile ? 0 : 2,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: social.is_visible ? 1 : 0.6,
                opacity: social.is_visible ? 1 : 0.3,
                x: x,
                y: y,
                rotate: leafRotation,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: index * 0.1,
              }}
              onClick={() => onToggleSocial?.(social.id)}
            >
              <motion.div
                className="relative"
                style={{
                  width: sizes.leafWidth,
                  height: sizes.leafHeight,
                  transform: 'translate(-50%, -50%)',
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: 'easeInOut',
                }}
              >
                <svg
                  viewBox="0 0 100 140"
                  className={`w-full h-full ${
                    social.is_visible
                      ? 'drop-shadow-lg'
                      : 'opacity-50'
                  }`}
                  style={{
                    filter: social.is_visible ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none',
                  }}
                >
                  <defs>
                    <linearGradient id={`leaf-gradient-${social.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#86efac" stopOpacity={social.is_visible ? 1 : 0.5} />
                      <stop offset="50%" stopColor="#4ade80" stopOpacity={social.is_visible ? 1 : 0.5} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={social.is_visible ? 1 : 0.5} />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 50 135 Q 40 120, 30 105 Q 20 90, 15 70 Q 10 50, 20 30 Q 30 10, 50 5 Q 70 10, 80 30 Q 90 50, 85 70 Q 80 90, 70 105 Q 60 120, 50 135 Z"
                    fill={`url(#leaf-gradient-${social.id})`}
                    stroke="#16a34a"
                    strokeWidth="1.5"
                    opacity={social.is_visible ? 1 : 0.4}
                  />

                  <path
                    d="M 50 120 Q 50 100, 50 80 M 50 100 Q 35 90, 25 80 M 50 100 Q 65 90, 75 80 M 50 80 Q 40 65, 35 50 M 50 80 Q 60 65, 65 50"
                    stroke="#16a34a"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>

                <div
                  className={`absolute top-[15%] left-1/2 -translate-x-1/2 ${sizes.iconSize} bg-white rounded-full p-2 shadow-md flex items-center justify-center z-10`}
                  style={{
                    width: size === 'small' ? '32px' : size === 'medium' ? '40px' : '48px',
                    height: size === 'small' ? '32px' : size === 'medium' ? '40px' : '48px',
                  }}
                >
                  {Icon && (
                    <div className={`${sizes.iconSize} text-primary`}>
                      <Icon />
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={social.id}
            className="absolute top-1/2 left-1/2"
            style={{
              x: x - 16,
              y: y - 16,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: social.is_visible ? 1 : 0.5,
              opacity: social.is_visible ? 1 : 0.4,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: index * 0.1,
            }}
          >
            <motion.button
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                social.is_visible
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              onClick={() => onToggleSocial?.(social.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
                ease: 'easeInOut',
              }}
            >
              {Icon && <Icon className="w-4 h-4" />}
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}
