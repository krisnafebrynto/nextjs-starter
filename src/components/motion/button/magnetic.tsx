"use client";

import type { Ref } from "react";
import { Magnetic } from "../magnetic";
import { Button, type ButtonProps } from "./base";

export interface MagneticButtonProps extends ButtonProps {
  /** Class applied to the magnetic wrapper. */
  magneticClassName?: string | undefined;
  ref?: Ref<HTMLButtonElement> | undefined;
  /** Magnetic pull strength. Default 0.25. */
  strength?: number | undefined;
}

export function MagneticButton({
  children,
  magneticClassName,
  ref,
  strength = 0.25,
  ...rest
}: MagneticButtonProps) {
  return (
    <Magnetic
      className={magneticClassName}
      strength={strength}
    >
      <Button
        ref={ref}
        {...rest}
      >
        {children}
      </Button>
    </Magnetic>
  );
}
