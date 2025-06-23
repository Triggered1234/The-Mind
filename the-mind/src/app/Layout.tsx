// src/app/layout.tsx
import { ReactNode } from 'react';

export const metadata = {
  title: 'The Mind - Joc de Cărți Cooperativ',
  description: 'Joacă The Mind online cu prietenii tăi',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}