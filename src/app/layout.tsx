'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import { registerServiceWorker } from '@/lib/pwa';
import { AuthProvider } from '@/contexts/AuthContext';
import { UpdateNotification } from '@/components/UpdateNotification';
import { Footer } from '@/components/Footer';
import packageJson from '../../package.json';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#722F37" />
        <meta name="description" content="Track your wine collection with elegance and ease" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sommething" />

        <title>Sommething - Wine Fridge Tracker</title>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <UpdateNotification />
          <Footer version={packageJson.version} />
        </AuthProvider>
      </body>
    </html>
  );
}
