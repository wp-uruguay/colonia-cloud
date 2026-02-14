import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";

import "./globals.css";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coloniacloud.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Colonia Cloud",
    template: "%s | Colonia Cloud",
  },
  description:
    "Desarrollo web, automatizaciones, CRM/ERP a medida y cloud services para equipos que buscan velocidad y control.",
  icons: {
    icon: "/images/brand/Iso.png",
  },
  openGraph: {
    title: "Colonia Cloud",
    description:
      "Soluciones digitales a medida: desarrollo web, automatizaciones, CRM/ERP y cloud services.",
    url: siteUrl,
    siteName: "Colonia Cloud",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Colonia Cloud",
    description:
      "Soluciones digitales a medida: desarrollo web, automatizaciones, CRM/ERP y cloud services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} antialiased`}
      >
        <div id="menu-layer" />
        <div className="site-shell grid-fade min-h-screen">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
