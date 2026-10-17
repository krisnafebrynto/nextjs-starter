import type { Viewport } from "next";

export const siteViewport: Viewport = {
  initialScale: 1,
  themeColor: [
    {
      color: "#FAFAFA",
      media: "prefers-color-scheme: light",
    },
    {
      color: "#0A0A0A",
      media: "prefers-color-scheme: dark",
    },
  ],
  viewportFit: "cover",
  width: "device-width",
};
