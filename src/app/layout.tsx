import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { CSSProperties } from 'react';
import './globals.css';
import { garage, siteUrl } from '@/config';
import { businessJsonLd, jsonLdScript } from '@/lib/structured-data';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileActionBar } from '@/components/layout/MobileActionBar';
import { Cursor } from '@/components/motion/Cursor';
import { MotionProvider } from '@/components/motion/MotionProvider';

const archivo = localFont({
  src: './fonts/archivo-wdth.woff2',
  variable: '--font-archivo',
  weight: '100 900',
  display: 'swap',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
});

const plexMono = localFont({
  src: './fonts/plex-mono-400.woff2',
  weight: '400',
  variable: '--font-plex-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: garage.seo.title, template: `%s · ${garage.brand.name}` },
  description: garage.seo.description,
  keywords: garage.seo.keywords,
  applicationName: garage.brand.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: garage.brand.name,
    title: garage.seo.title,
    description: garage.seo.description,
    url: '/',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: garage.brand.name }],
  },
  twitter: { card: 'summary_large_image', title: garage.seo.title, description: garage.seo.description, images: ['/og.jpg'] },
  formatDetection: { telephone: false, address: false, email: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0e0f11',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brandVars = {
    '--brand-accent': garage.brand.colors.accent,
    '--brand-accent-ink': garage.brand.colors.accentInk,
  } as CSSProperties;

  return (
    <html lang="fr" className={`${archivo.variable} ${plexMono.variable}`} style={brandVars}>
      <body>
        <a
          href="#contenu"
          className="fixed top-3 left-3 z-[100] -translate-y-24 bg-accent px-4 py-3 label text-accent-ink transition-transform focus:translate-y-0"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="contenu" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <MobileActionBar />
        <Cursor />
        <MotionProvider />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(businessJsonLd()) }} />
      </body>
    </html>
  );
}
