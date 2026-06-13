import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Campus Lost & Found - Find & Return Items easily',
  description: 'Locate items lost within the college campus. Post detailed reports of lost or found belongings, and chat directly to arrange returns.',
  keywords: ['campus lost and found', 'college lost and found', 'find items', 'report items', 'open chat', 'lost items', 'found items'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
