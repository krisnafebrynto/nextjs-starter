"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { type MouseEvent, type ReactNode, useCallback, useState } from "react";
import { EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface ActionSwapItem {
  ariaLabel?: string | undefined;
  icon?: ReactNode | undefined;
  id: string;
  label: ReactNode;
}

export type ActionSwapButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ActionSwapButtonSize = "sm" | "md" | "lg" | "icon";
export type ActionSwapAnimation = "blur" | "roll" | "cascade";

/** Animations with a single-element variant set (cascade animates per letter). */
type CoreAnimation = "blur" | "roll";

export interface ActionSwapButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  animation?: ActionSwapAnimation | undefined;
  className?: string | undefined;
  cycle?: boolean | undefined;
  defaultValue?: string | undefined;
  disabled?: boolean | undefined;
  iconOnly?: boolean | undefined;
  items: ActionSwapItem[];
  onValueChange?: ((value: string, item: ActionSwapItem) => void) | undefined;
  size?: ActionSwapButtonSize | undefined;
  value?: string | undefined;
  variant?: ActionSwapButtonVariant | undefined;
}

export interface ActionSwapTextProps {
  animation?: ActionSwapAnimation | undefined;
  children: ReactNode;
  className?: string | undefined;
  value: string;
}

export interface ActionSwapIconProps {
  animation?: ActionSwapAnimation | undefined;
  children: ReactNode;
  className?: string | undefined;
  value: string;
}

const BLUR_TRANSITION = { duration: 0.2, ease: "easeInOut" } as const;
const ROLL_TRANSITION = SPRING_SWAP;
const ROLL_EXIT_TRANSITION = { duration: 0.14, ease: EASE_OUT } as const;
const SWAP_BLUR = "blur(8px)";
const ROLL_BLUR = "blur(3px)";

// Cascade rolls the label one letter at a time, left to right. The leaving
// and landing strings overlap as independent layers (no shared cells), so
// proportional glyph widths never jitter. Exits cascade at half the enter
// stagger so the tail of the old label lingers briefly.
const CASCADE_STAGGER = 0.025;

const CASCADE_LETTER_VARIANTS: Variants = {
  animate: (delay = 0) => ({
    filter: "blur(0px)",
    opacity: 1,
    transition: { ...SPRING_SWAP, delay },
    y: "0%",
  }),
  exit: (delay = 0) => ({
    filter: ROLL_BLUR,
    opacity: 0,
    transition: { delay: delay * 0.5, duration: 0.16, ease: EASE_OUT },
    y: "-105%",
  }),
  initial: { filter: ROLL_BLUR, opacity: 0, y: "105%" },
};

const TEXT_VARIANTS: Record<CoreAnimation, Variants> = {
  blur: {
    animate: {
      filter: "blur(0px)",
      opacity: 1,
      scale: 1,
      transition: BLUR_TRANSITION,
    },
    exit: {
      filter: SWAP_BLUR,
      opacity: 0,
      scale: 0.94,
      transition: BLUR_TRANSITION,
    },
    initial: { filter: SWAP_BLUR, opacity: 0, scale: 0.94 },
  },
  roll: {
    animate: {
      filter: "blur(0px)",
      opacity: 1,
      transition: ROLL_TRANSITION,
      y: "0%",
    },
    exit: {
      filter: ROLL_BLUR,
      opacity: 0,
      transition: ROLL_EXIT_TRANSITION,
      y: "-90%",
    },
    initial: { filter: ROLL_BLUR, opacity: 0, y: "90%" },
  },
};

const ICON_VARIANTS: Record<CoreAnimation, Variants> = {
  blur: {
    animate: {
      filter: "blur(0px)",
      opacity: 1,
      scale: 1,
      transition: BLUR_TRANSITION,
    },
    exit: {
      filter: SWAP_BLUR,
      opacity: 0,
      scale: 0.25,
      transition: BLUR_TRANSITION,
    },
    initial: { filter: SWAP_BLUR, opacity: 0, scale: 0.25 },
  },
  roll: {
    animate: {
      filter: "blur(0px)",
      opacity: 1,
      transition: ROLL_TRANSITION,
      y: 0,
    },
    exit: {
      filter: ROLL_BLUR,
      opacity: 0,
      transition: ROLL_EXIT_TRANSITION,
      y: -12,
    },
    initial: { filter: ROLL_BLUR, opacity: 0, y: 12 },
  },
};

const VARIANT_CLASS: Record<ActionSwapButtonVariant, string> = {
  ghost: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted/60",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-card text-foreground hover:border-border",
};

const SIZE_CLASS: Record<ActionSwapButtonSize, string> = {
  icon: "h-10 w-10 rounded-full",
  lg: "h-12 gap-2.5 rounded-full px-5 text-base",
  md: "h-10 gap-2 rounded-full px-4 text-sm",
  sm: "h-8 gap-1.5 rounded-full px-3 text-xs",
};

export function ActionSwapText({
  value,
  children,
  animation = "blur",
  className,
}: ActionSwapTextProps) {
  const reduce = useReducedMotion();

  // Cascade needs a plain string to split into letters; non-string content
  // and reduced motion fall back to the closest single-element animation.
  const label = typeof children === "string" ? children : null;
  const cascade = animation === "cascade" && label !== null && !reduce;
  const coreAnimation: CoreAnimation = animation === "cascade" ? "roll" : animation;

  return (
    <span
      className={cn(
        "relative -my-[0.08em] inline-block max-w-full whitespace-nowrap py-[0.08em] align-bottom",
        className
      )}
      style={{
        clipPath: "inset(0 -999px)",
        WebkitClipPath: "inset(0 -999px)",
      }}
    >
      <span
        aria-hidden
        className="invisible inline-block whitespace-nowrap"
      >
        {cascade
          ? label.split("").map((char, index) => (
              <span
                className="inline-block whitespace-pre"
                // biome-ignore lint/suspicious/noArrayIndexKey: position is the slot identity.
                key={index}
              >
                {char}
              </span>
            ))
          : (children ?? null)}
      </span>
      {cascade ? (
        <>
          {/* Letters are decorative fragments; readers get the whole label. */}
          <span className="sr-only">{label}</span>
          <AnimatePresence initial={false}>
            <motion.span
              animate="animate"
              aria-hidden
              className="absolute top-[0.08em] left-0 inline-block whitespace-pre"
              exit="exit"
              initial="initial"
              key={`cascade-${value}`}
            >
              {label.split("").map((char, i) => (
                <motion.span
                  className="inline-block whitespace-pre will-change-[opacity,filter,transform]"
                  custom={i * CASCADE_STAGGER}
                  // biome-ignore lint/suspicious/noArrayIndexKey: position is the slot identity — the letter at a position is exactly what rolls.
                  key={i}
                  variants={CASCADE_LETTER_VARIANTS}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </>
      ) : (
        <AnimatePresence initial={false}>
          <motion.span
            animate={reduce ? { filter: "blur(0px)", opacity: 1, scale: 1, y: 0 } : "animate"}
            // Truncation lives on the layer that holds the text — the layer
            // moves as a whole, so clipping it never eats the roll.
            className="absolute top-[0.08em] left-0 inline-block max-w-full truncate will-change-[opacity,filter,transform]"
            initial={reduce ? false : "initial"}
            key={`${animation}-${value}`}
            variants={TEXT_VARIANTS[coreAnimation]}
            {...(reduce ? {} : { exit: "exit" })}
          >
            {children}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  );
}

export function ActionSwapIcon({
  value,
  children,
  animation = "blur",
  className,
}: ActionSwapIconProps) {
  const reduce = useReducedMotion();
  // Icons are single elements — cascade maps to its closest motion, roll.
  const coreAnimation: CoreAnimation = animation === "cascade" ? "roll" : animation;

  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden", className)}
    >
      <AnimatePresence
        initial={false}
        mode="popLayout"
      >
        <motion.span
          animate={reduce ? { filter: "blur(0px)", opacity: 1, scale: 1, y: 0 } : "animate"}
          aria-hidden
          className="col-start-1 row-start-1 inline-flex items-center justify-center will-change-[opacity,filter,transform]"
          initial={reduce ? false : "initial"}
          key={`${animation}-${value}`}
          variants={ICON_VARIANTS[coreAnimation]}
          {...(reduce ? {} : { exit: "exit" })}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function ActionSwapButton({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "secondary",
  size = "md",
  animation = "blur",
  iconOnly = size === "icon",
  cycle = true,
  className,
  disabled,
  onClick,
  ...rest
}: ActionSwapButtonProps) {
  const reduce = useReducedMotion();
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.id);
  const currentValue = value ?? internalValue;
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === currentValue)
  );
  const activeItem = items[activeIndex] ?? items[0];
  const hasIcon = items.some((item) => item.icon);
  const nextItem = cycle && items.length > 0 ? items[(activeIndex + 1) % items.length] : undefined;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled || !cycle || !nextItem) {
        return;
      }
      if (value === undefined) {
        setInternalValue(nextItem.id);
      }
      onValueChange?.(nextItem.id, nextItem);
    },
    [cycle, disabled, nextItem, onClick, onValueChange, value]
  );

  if (!activeItem) {
    return null;
  }

  const accessibleLabel =
    activeItem.ariaLabel ??
    (iconOnly && typeof activeItem.label === "string" ? activeItem.label : undefined);

  return (
    <motion.button
      aria-label={accessibleLabel}
      className={cn(
        "inline-flex items-center justify-center overflow-hidden font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className
      )}
      disabled={disabled}
      onClick={handleClick}
      transition={SPRING_PRESS}
      type="button"
      {...(reduce || disabled ? {} : { whileTap: { scale: 0.97 } })}
      {...rest}
    >
      {hasIcon ? (
        <ActionSwapIcon
          animation={animation}
          className="h-4 w-4"
          value={activeItem.id}
        >
          {activeItem.icon ?? null}
        </ActionSwapIcon>
      ) : null}
      {iconOnly ? null : (
        <ActionSwapText
          animation={animation}
          value={activeItem.id}
        >
          {activeItem.label}
        </ActionSwapText>
      )}
    </motion.button>
  );
}
