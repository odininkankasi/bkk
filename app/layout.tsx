import type { Metadata, Viewport } from "next";
import { Lora, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkkitaplik.com";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5eedc" },
    { media: "(prefers-color-scheme: dark)", color: "#14100c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "İthaki Bilimkurgu Klasikleri — Dijital Kitaplık & Okuma Rehberi",
    template: "%s | İthaki BKK",
  },
  description:
    "İthaki Yayınları Bilimkurgu Klasikleri (BKK) dizisindeki 116 kitabın künyesi, çevirmenleri, okuma sıraları ve kişisel okuma günlüğü.",
  keywords: [
    "İthaki Bilimkurgu Klasikleri",
    "İthaki BKK",
    "Bilimkurgu Klasikleri Listesi",
    "BKK Sıralı Liste",
    "Dune Serisi Sırası",
    "Mars Üçlemesi",
    "İthaki Çevirmenler",
    "Bilimkurgu Kitaplığı",
  ],
  authors: [{ name: "BKK Okuma Topluluğu" }],
  creator: "BKK Kitaplık",
  publisher: "İthaki Bilimkurgu Klasikleri Rehberi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BKK Kitaplık",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "İthaki Bilimkurgu Klasikleri Dijital Kitaplık",
    title: "İthaki Bilimkurgu Klasikleri (BKK) — Külliyat & Okuma Portalı",
    description:
      "İthaki Yayınları Bilimkurgu Klasikleri dizisindeki 116 eserin tam listesi, çevirmenleri, yayın yılları ve okuma takibi.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "İthaki Bilimkurgu Klasikleri Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "İthaki Bilimkurgu Klasikleri Dijital Kitaplık",
    description:
      "İthaki Yayınları Bilimkurgu Klasikleri dizisindeki 116 eserin tam listesi, çevirmenleri ve okuma rehberi.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "İthaki Bilimkurgu Klasikleri Portalı",
    url: siteUrl,
    description:
      "İthaki Yayınları Bilimkurgu Klasikleri külliyatının 116 ciltlik tam listesi, çevirmenler ve yazarlar atlası.",
    inLanguage: "tr-TR",
  };

  return (
    <html
      lang="tr"
      data-theme="light"
      className={`${lora.variable} ${outfit.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col selection:bg-amber-900/20 selection:text-amber-950 pb-16 sm:pb-0">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
