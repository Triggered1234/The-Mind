// app/layout.tsx
import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'The Mind - Joc de Cărți Cooperativ',
  description: 'Un joc de cărți cooperativ minunat pentru 2-4 jucători. Joacă online cu prietenii!',
  keywords: 'joc, carti, cooperativ, online, the mind',
  authors: [{ name: 'The Mind Game Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#C2730A',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#C2730A" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}