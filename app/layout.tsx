import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';
import Providers from './providers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const heading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Loopboard',
  description: 'Loopboard is a web-based task management application that helps you organize your tasks and projects efficiently.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="max-w-5xl w-full mx-auto p-4 flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
