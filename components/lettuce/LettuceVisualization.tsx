'use client';

import { motion } from 'framer-motion';
import { Linkedin, Instagram, Github, Youtube } from 'lucide-react';
import { SocialPlatform } from '@/lib/supabase';

type LettuceVisualizationProps = {
  socials: SocialPlatform[];
  onToggleSocial?: (socialId: string) => void;
  size?: 'small' | 'medium' | 'large';
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
  small: { container: 'w-32 h-32', leaf: 'w-6 h-6', center: 'w-16 h-16' },
  medium: { container: 'w-48 h-48', leaf: 'w-8 h-8', center: 'w-24 h-24' },
  large: { container: 'w-64 h-64', leaf: 'w-10 h-10', center: 'w-32 h-32' },
};

export function LettuceVisualization({
  socials,
  onToggleSocial,
  size = 'large'
}: LettuceVisualizationProps) {
  const sizes = sizeMap[size];
  const radius = size === 'small' ? 50 : size === 'medium' ? 70 : 100;

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
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${sizes.center} bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40`}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="text-primary text-4xl">🥬</div>
      </motion.div>

      {socials.map((social, index) => {
        const angle = (index / socials.length) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const Icon = platformIcons[social.platform as keyof typeof platformIcons];

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
              className={`${sizes.leaf} rounded-full flex items-center justify-center transition-colors ${
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
