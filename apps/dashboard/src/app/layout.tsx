import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import LayoutWrapper from '@/components/LayoutWrapper';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'AgentKey | AI Agent Security & Identity',
  description:
    'The protocol-first security layer for AI agents. Identity, vaulting, and compliance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
        <body className="antialiased font-sans">
          <LayoutWrapper>{children}</LayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
