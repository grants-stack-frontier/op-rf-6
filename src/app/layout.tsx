import { Inter } from 'next/font/google';

import { BallotRound5Provider } from '@/components/ballot/provider5';
import { BudgetProvider } from '@/components/budget/provider';
import { ThemeProvider } from '@/components/common/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

import '@rainbow-me/rainbowkit/styles.css';

import { ClientLayout } from './client-layout';
import './globals.css';
import { metadata } from './layout-metadata';
import { Provider } from './providers';

export { metadata };

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon-32x32.png" sizes="any" />
      <body
        className={cn(
          'min-h-screen bg-background antialiased',
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Provider>
            <BallotRound5Provider>
              <BudgetProvider>
                <ClientLayout>{children}</ClientLayout>
              </BudgetProvider>
            </BallotRound5Provider>
          </Provider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
