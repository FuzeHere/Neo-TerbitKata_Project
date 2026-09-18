import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getStaticBaseUrl } from "@/lib/url";

export const metadata: Metadata = {
  metadataBase: new URL(getStaticBaseUrl()),
  title: {
    default: "TerbitKata - Portal Berita Digital Terpercaya",
    template: "%s | TerbitKata",
  },
  description: "Portal berita digital independen terpercaya dengan berita teraktual dan mendalam.",
  openGraph: {
    title: "TerbitKata - Portal Berita Digital Terpercaya",
    description: "Portal berita digital independen terpercaya dengan berita teraktual dan mendalam.",
    siteName: "TerbitKata",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "TerbitKata",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TerbitKata - Portal Berita Digital Terpercaya",
    description: "Portal berita digital independen terpercaya dengan berita teraktual dan mendalam.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
