import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { QueryProvider } from '@/lib/query/provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MINDTHREAD — your second mind',
  description:
    'A sanctuary for raw thought, refined by AI to uncover patterns and promote clarity.',
};

export const viewport: Viewport = {
  themeColor: '#07091A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body>
        <QueryProvider>
          <div className="app-shell">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
