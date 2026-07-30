import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";

import {
  config,
} from "@fortawesome/fontawesome-svg-core";

import "@fortawesome/fontawesome-svg-core/styles.css";

import LaCuraAIBot from "@/components/LaCuraAIBot";
import NetworkStatus from "@/components/NetworkStatus";
import OfflineSync from "@/components/OfflineSync";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "La-Cura",
  description:
    "Healthcare Management System",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "La-Cura",
  },

  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#166534",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <OfflineSync />

        <NetworkStatus />

        {children}

        <LaCuraAIBot />
      </body>
    </html>
  );
}