import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SwimTracker",
  description: "Track your swimming workouts and progress",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}; 