import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface FadeInOnScrollProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
}

export const FadeInOnScroll = ({
  children,
  delay = 0,
  duration = 0.5,
  y = 30,
  className = '',
}: FadeInOnScrollProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
