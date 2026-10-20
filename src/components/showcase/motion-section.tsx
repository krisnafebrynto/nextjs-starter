"use client";

import { MotionConfig, motion } from "motion/react";

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
}

function MotionSection({ children, className }: MotionSectionProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.section className={className}>{children}</motion.section>
    </MotionConfig>
  );
}

export { MotionSection };
