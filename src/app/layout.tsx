import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Ensure Toaster is imported

export const metadata: Metadata = {
  title: 'SpendSmart - Track Your Expenses',
  description: 'Monitor daily, weekly, and monthly expenditure with SpendSmart.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        {children}
         <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
