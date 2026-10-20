"use client";

import { AnimatePresence, type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { type PointerEvent, type ReactNode, type Ref, useCallback, useRef, useState } from "react";
import { useHoverCapable } from "@/hooks/use-hover-capable";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: ReactNode | undefined;
  className?: string | undefined;
  pressScale?: number | undefined;
  ref?: Ref<HTMLButtonElement> | undefined;
  /** Spawn a Material-style ripple from the press point. Off by default. */
  ripple?: boolean | undefined;
  size?: ButtonSize | undefined;
  variant?: ButtonVariant | undefined;
}

export interface ButtonLinkProps extends Omit<HTMLMotionProps<"a">, "children"> {
  children?: ReactNode | undefined;
  className?: string | undefined;
  pressScale?: number | undefined;
  ref?: Ref<HTMLAnchorElement> | undefined;
  size?: ButtonSize | undefined;
  variant?: ButtonVariant | undefined;
}

interface Ripple {
  id: number;
  size: number;
  x: number;
  y: number;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/60",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted/60",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-card text-foreground hover:border-border",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  icon: "h-8 w-8 rounded-lg",
  lg: "h-12 px-6 text-base gap-2 rounded-full",
  md: "h-10 px-5 text-sm gap-2 rounded-full",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-full",
};

function pressMotion({
  canHover,
  pressScale,
  reduce,
}: {
  canHover: boolean;
  pressScale: number;
  reduce: boolean | null;
}) {
  // Keep gestures attached so Motion's SSR attributes stay stable.
  return {
    whileHover: { scale: canHover && !reduce ? 1.02 : 1 },
    whileTap: { scale: reduce ? 1 : pressScale },
  };
}

function RippleEffect({
  ripple,
  onComplete,
}: {
  ripple: Ripple;
  onComplete: (id: number) => void;
}) {
  const handleComplete = useCallback(() => {
    onComplete(ripple.id);
  }, [onComplete, ripple.id]);

  return (
    <motion.span
      animate={{ opacity: 0, scale: 1 }}
      className="absolute rounded-full bg-current"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0.3, scale: 0.05 }}
      key={ripple.id}
      onAnimationComplete={handleComplete}
      style={{
        height: ripple.size,
        left: ripple.x,
        top: ripple.y,
        width: ripple.size,
        x: "-50%",
        y: "-50%",
      }}
      transition={{ duration: 1.6, ease: EASE_OUT }}
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  pressScale = 0.93,
  ripple = false,
  className,
  children,
  onPointerDown,
  ref,
  ...rest
}: ButtonProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (ripple && !reduce) {
        const rect = event.currentTarget.getBoundingClientRect();
        const rippleSize = Math.max(rect.width, rect.height) * 2;
        const id = nextId.current;
        nextId.current += 1;
        setRipples((prev) => [
          ...prev,
          {
            id,
            size: rippleSize,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          },
        ]);
      }
      onPointerDown?.(event);
    },
    [ripple, reduce, onPointerDown]
  );

  const handleRippleComplete = useCallback((id: number) => {
    setRipples((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <motion.button
      className={cn(
        "inline-flex select-none items-center justify-center font-medium",
        "transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        ripple && "relative overflow-hidden",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className
      )}
      onPointerDown={handlePointerDown}
      ref={ref}
      transition={SPRING_PRESS}
      type="button"
      {...pressMotion({ canHover, pressScale, reduce })}
      {...rest}
    >
      {ripple ? (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <AnimatePresence>
            {ripples.map((r) => (
              <RippleEffect
                key={r.id}
                onComplete={handleRippleComplete}
                ripple={r}
              />
            ))}
          </AnimatePresence>
        </span>
      ) : null}
      {children}
    </motion.button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  pressScale = 0.93,
  className,
  children,
  ref,
  ...rest
}: ButtonLinkProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();

  return (
    <motion.a
      className={cn(
        "inline-flex select-none items-center justify-center font-medium",
        "transition-colors",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className
      )}
      ref={ref}
      transition={SPRING_PRESS}
      {...pressMotion({ canHover, pressScale, reduce })}
      {...rest}
    >
      {children}
    </motion.a>
  );
}
