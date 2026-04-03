import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import Script from 'next/script';
import DeveloperBadge from '@/components/DeveloperBadge';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  title: 'B-bot',
  description: 'قم بتوليد أبحاث أكاديمية متميزة باللغة العربية باستخدام الذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        {children}
        {/* زر المبرمج (Developer Badge Component) */}
        <DeveloperBadge />

        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
