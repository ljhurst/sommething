'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import { registerServiceWorker } from '@/lib/pwa';
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>Sommething - Wine Fridge Tracker</title>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
