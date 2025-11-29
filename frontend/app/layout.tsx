import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/providers/AppProviders';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { CartSidebar } from '@/components/cart/CartSidebar';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'FashionStore - Modern Ecommerce Platform',
    template: '%s | FashionStore'
  },
  description: 'Discover the latest fashion trends with our modern ecommerce platform. Shop clothing, accessories, and more with multiple payment options including M-Pesa.',
  keywords: 'fashion, ecommerce, clothing, accessories, modern, M-Pesa, online shopping',
  authors: [{ name: 'FashionStore Team' }],
  creator: 'FashionStore',
  publisher: 'FashionStore',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fashionstore.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fashionstore.com',
    siteName: 'FashionStore',
    title: 'FashionStore - Modern Ecommerce Platform',
    description: 'Discover the latest fashion trends with our modern ecommerce platform.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FashionStore - Modern Ecommerce',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FashionStore - Modern Ecommerce Platform',
    description: 'Discover the latest fashion trends with our modern ecommerce platform.',
    images: ['/twitter-image.jpg'],
    creator: '@fashionstore',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0284c7',
};

// Client wrapper for layout components
function ClientLayout({ children }: { children: React.ReactNode }) {
  // Check if we're on an auth page to conditionally show header/footer
  const isAuthPage = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/auth/login') || 
     window.location.pathname.includes('/auth/register'));

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: isAuthPage ? '#f9fafb' : '#ffffff'
    }}>
      {/* Only show header and footer on non-auth pages */}
      {!isAuthPage && (
        <>
          <Header />
          <main style={{ 
            flex: 1,
            minHeight: 'calc(100vh - 140px)',
          }}>
            {children}
          </main>
          <Footer />
        </>
      )}
      
      {/* For auth pages, show full screen centered content */}
      {isAuthPage && (
        <main style={{ 
          flex: 1,
          minHeight: '100vh',
        }}>
          {children}
        </main>
      )}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <AppProviders>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AppProviders>
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'FashionStore',
              url: 'https://fashionstore.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://fashionstore.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}