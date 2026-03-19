import { Inter } from 'next/font/google';
import "./globals.css";
import ClientLayout from '@/components/ClientLayout';
import { metadata, viewport } from './metadata';

const inter = Inter({ subsets: ['latin'] });

export { metadata, viewport };

type LayoutProps = {
  children: React.ReactNode;
  params?: Promise<Record<string, string | string[]>>;
  searchParams?: Promise<Record<string, string | string[]>>;
};

export default async function RootLayout({
  children,
  params,
  searchParams,
}: LayoutProps) {
  await Promise.all([
    params ?? Promise.resolve({}),
    searchParams ?? Promise.resolve({}),
  ]);
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
