"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";

const FOCUSABLE =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
const inertOwners = new Map<HTMLElement, { count: number; previous: boolean }>();
let scrollOwners = 0;
let previousOverflow = "";

function handleKeyNavigation(
  event: KeyboardEvent,
  panelElement: HTMLElement | null,
  closeModal: () => void,
  focusables: () => HTMLElement[]
) {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    closeModal();
    return;
  }
  if (event.key !== "Tab") {
    return;
  }
  const elements = focusables();
  const [first] = elements;
  const last = elements.at(-1);
  if (!(first && last)) {
    event.preventDefault();
    panelElement?.focus();
    return;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/** A portal root owns sibling inertness and scroll locking until its open state ends. */
export function useModalScope(
  open: boolean,
  root: RefObject<HTMLElement | null>,
  panel: RefObject<HTMLElement | null>,
  onClose: () => void
) {
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!(open && root.current && panel.current)) {
      return;
    }
    const returnFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const siblings = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== root.current
    );
    for (const element of siblings) {
      const owner = inertOwners.get(element) ?? {
        count: 0,
        previous: element.inert,
      };
      owner.count += 1;
      inertOwners.set(element, owner);
      element.inert = true;
    }
    if (scrollOwners === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollOwners += 1;
    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (element) => element.tabIndex >= 0 && !element.closest("[inert]")
      );
    const focusFirst = () => (focusables()[0] ?? panel.current)?.focus({ preventScroll: true });
    focusFirst();
    const onFocus = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        !panel.current?.contains(event.target) &&
        !root.current?.inert
      ) {
        focusFirst();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (root.current?.inert) {
        return;
      }
      handleKeyNavigation(event, panel.current, close.current, focusables);
    };
    document.addEventListener("focusin", onFocus);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("keydown", onKey);
      for (const element of siblings) {
        const owner = inertOwners.get(element);
        if (owner) {
          owner.count -= 1;
          if (owner.count === 0) {
            element.inert = owner.previous;
            inertOwners.delete(element);
          }
        }
      }
      scrollOwners -= 1;
      if (scrollOwners === 0) {
        document.body.style.overflow = previousOverflow;
      }
      if (returnFocus?.isConnected && !returnFocus.closest("[inert]")) {
        returnFocus.focus({ preventScroll: true });
      }
    };
  }, [open, root, panel]);
}
