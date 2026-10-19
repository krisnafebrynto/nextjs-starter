"use client";

import { MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
}

function MotionSection({ children, className }: MotionSectionProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        animate={{ y: 0 }}
        // Keep the static shell unshifted before Motion hydrates.
        className={cn("motion-reduce:transform-none!", className)}
        initial={{ y: 16 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.section>
    </MotionConfig>
  );
}

export { MotionSection };
