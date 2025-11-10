import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'श्री · Yashuuu Voice Guide',
  description:
    'Marathi voice companion for Yashuuu focusing on calm motivation, wealth mindset, and daily habits.',
  openGraph: {
    title: 'श्री · Voice Guide',
    description:
      'Calm Marathi voice guidance for motivation, wealth mindset, and daily action.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'श्री · Voice Guide',
    description:
      'Calm Marathi voice guidance for motivation, wealth mindset, and daily action.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
