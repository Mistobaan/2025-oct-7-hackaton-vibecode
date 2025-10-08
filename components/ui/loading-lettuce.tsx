'use client';

import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface LoadingLettuceProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingLettuce({ size = 'md' }: LoadingLettuceProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={sizeClasses[size]}
      >
        <Leaf className="w-full h-full text-primary" />
      </motion.div>
    </div>
  );
}
