// app/layout.tsx
import './css/homepage.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'The Mind',
  description: 'A mind game',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
