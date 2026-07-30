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
  metadataBase: new URL(
    "https://la-cura.vercel.app"
  ),

  title: {
    default: "La-Cura Healthcare",
    template: "%s | La-Cura",
  },

  description:
    "Compassionate nursing care, elderly care, healthcare technology, and medical products in Cameroon.",

  applicationName: "La-Cura",

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "La-Cura",
  },

  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://la-cura.vercel.app",
    siteName: "La-Cura Healthcare",
    title: "La-Cura Healthcare",
    description:
      "Compassionate care for every life. Nursing care, elderly care, healthcare technology, and medical products.",
  },

  twitter: {
    card: "summary_large_image",
    title: "La-Cura Healthcare",
    description:
      "Compassionate care for every life.",
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