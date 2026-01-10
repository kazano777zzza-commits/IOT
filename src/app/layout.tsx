import type { Metadata } from 'next';
import { Inter, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
});

const fontMono = Source_Code_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Giám Sát Văn Phòng Nam Dương',
  description: 'Hệ thống giám sát môi trường phòng làm việc thông minh',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
