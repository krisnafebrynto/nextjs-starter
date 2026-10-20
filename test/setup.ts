import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

const [{ cleanup }, { MotionGlobalConfig }] = await Promise.all([
  import("@testing-library/react"),
  import("motion/react"),
]);

// Happy DOM cancels WAAPI animations on unmount, which Motion reports as unhandled.
MotionGlobalConfig.skipAnimations = true;

afterEach(() => {
  cleanup();
  localStorage.clear();

  const root = document.documentElement;
  root.className = "";
  root.style.colorScheme = "";
});
