import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export const AnimatedCard = ({
  children,
  className = '',
  delay = 0,
  hover = true,
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.01,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn('glass-card rounded-2xl', className)}
    >
      {children}
    </motion.div>
  );
};
