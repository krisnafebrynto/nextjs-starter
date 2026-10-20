export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to document.execCommand fallback.
    }
  }

  if (typeof document !== "undefined") {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const textArea = document.createElement("textarea");
    try {
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      textArea.style.opacity = "0";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);
      textArea.select();
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textArea.remove();
      previousFocus?.focus({ preventScroll: true });
    }
  }

  return false;
}
