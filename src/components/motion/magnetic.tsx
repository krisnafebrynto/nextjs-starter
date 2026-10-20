"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { type MouseEvent, type ReactNode, useCallback, useRef } from "react";
import { useHoverCapable } from "@/hooks/use-hover-capable";
import { SPRING_MOUSE } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface MagneticProps {
  children: ReactNode;
  className?: string | undefined;
  strength?: number | undefined;
}

export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  // Decorative cursor-follow: skip on touch (phantom hover) and reduced motion.
  const enabled = !reduce && canHover;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING_MOUSE);
  const sy = useSpring(y, SPRING_MOUSE);

  const handleMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!(el && enabled)) {
        return;
      }
      const rect = el.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * strength);
      y.set((e.clientY - rect.top - rect.height / 2) * strength);
    },
    [enabled, strength, x, y]
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      className={cn("inline-block", className)}
      onMouseLeave={handleLeave}
      onMouseMove={handleMove}
      ref={ref}
      style={{ x: sx, y: sy }}
    >
      {children}
    </motion.div>
  );
}
