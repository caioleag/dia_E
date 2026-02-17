import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { NavigationEvents } from "@/components/NavigationEvents";
import { PageTransition } from "@/components/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dia E - Falar ou Fazer",
  description: "Jogo social de Falar ou Fazer para grupos e casais",
  manifest: "/manifest.json",
  applicationName: "Dia E",
  keywords: ["falar ou fazer", "jogo", "casal", "grupo", "desafio"],
  authors: [{ name: "Dia E" }],
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6B21A8" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0F" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dia E" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans bg-bg-deep text-text-primary min-h-screen">
        <NavigationEvents />
        <PWAInstallPrompt />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
