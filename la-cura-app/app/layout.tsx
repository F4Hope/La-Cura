import type {
  Metadata,
  Viewport,
} from "next";

import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Serif,
} from "next/font/google";

import "./globals.css";
import "./la-cura-clinical-polish.css";
import "./pcc-clinical.css";

import {
  config,
} from "@fortawesome/fontawesome-svg-core";

import "@fortawesome/fontawesome-svg-core/styles.css";

import LaCuraAIBot from "@/components/LaCuraAIBot";
import NetworkStatus from "@/components/NetworkStatus";
import OfflineSync from "@/components/OfflineSync";

config.autoAddCss = false;

const laCuraSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-la-cura-sans",
  display: "swap",
});

const laCuraSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-la-cura-serif",
  display: "swap",
});

const laCuraMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-la-cura-mono",
  display: "swap",
});

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

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "La-Cura",
  },

  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
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
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
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
      <body
        className={`${laCuraSans.variable} ${laCuraSerif.variable} ${laCuraMono.variable}`}
      >
        <OfflineSync />

        <NetworkStatus />

        {children}

        <LaCuraAIBot />
      </body>
    </html>
  );
}